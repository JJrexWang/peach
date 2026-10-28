/* 数据管理页上的「整理」（ADR-0039）：选来源、填两份模板、预览、执行，外加整批回滚。
 *
 * 预览是一次同步请求，结果只活在这张卡上；执行与回滚是同一趟后台任务，快照摊在
 * `/api/organize` 的顶层，所以 `useBackgroundJob` 用 `withJob` 只换任务那几格，来源、模板
 * 与上一批原样留着。执行与回滚动的是真实文件名与数据库路径，都要先过确认弹层。 */
import { useLayoutEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { confirmModal, MEDIA_SOURCE_ICONS } from '@peach/legacy/ui';
import { LOC } from '@peach/legacy/core';

import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Input } from '@/components/base/input/input';
import { Select, SelectItem } from '../components/select';

import { errorMessage } from '../../api';
import { useBackgroundJob } from '../background-job';
import { Fieldset, FieldsetTitle } from '../components/fieldset';
import { Note } from '../components/note';
import { TaskProgress } from '../components/task-progress';
import { queryClient } from '../query';
import { SourceMark } from '../settings/section';
import { FolderSearchIcon } from '../settings/folder-rows';
import { busyProps } from '../settings/use-action';
import {
  baseName, DIRECTORY_TEMPLATE_ERROR, fetchOrganize, fetchOrganizeExample, ORGANIZE_KEY, organizeOutcome, planSummary,
  pickOrganizeFolder, previewOrganize, rememberTemplates, saveOrganizeSchemes, startOrganize, withOrganizeJob,
  type OrganizeCommand, type OrganizeData, type OrganizeJob, type OrganizePlan, type OrganizeScheme,
} from './organize';

const APPLY_BODY = (name: string, path: string) => `将整理「${name}」${path ? `的「${path}」及其子目录` : '上的文件名与目录'}，清理特殊符号与乱码，并按已填模板改名或移动。目标已存在的行会整行跳过。`
  + '这一批会记进批次列表，之后可以整批退回。';
const ROLLBACK_BODY = (batch: string) => `将把批次「${batch}」整理动过的文件退回整理前的名字与位置，数据库路径跟着退回。`
  + '退回后这一批不再出现在这里。';
/** 预览只列前 8 行：这里是给人扫一眼方向对不对，完整计划在 CSV 里。 */
const PLAN_ROWS = 8;

function PlanRows({ plan }: { plan: OrganizePlan }) {
  return (
    <>
      <ol className="mt-2 flex min-w-0 flex-col gap-1">
        {plan.rows.slice(0, PLAN_ROWS).map((row) => (
          <li key={row.current_path}
            className="flex min-w-0 items-center gap-2 text-caption-1-regular text-text-secondary">
            <span data-middle-truncate title={row.current_path} className="min-w-0 truncate">{baseName(row.current_path)}</span>
            <span aria-hidden>→</span>
            <span data-middle-truncate title={row.target_path} className="min-w-0 truncate text-text-primary">{baseName(row.target_path)}</span>
          </li>
        ))}
      </ol>
      {plan.truncated || plan.rows.length > PLAN_ROWS
        ? <p className="text-caption-1-regular text-text-secondary">只列出前 8 行，完整计划在计划 CSV 里。</p>
        : null}
    </>
  );
}

export function OrganizeCard(
  { toast, failure }: { toast(message: string): void; failure(action: string, error: unknown): void },
) {
  const organize = useQuery({ queryKey: ORGANIZE_KEY, queryFn: ({ signal }) => fetchOrganize(signal) });
  const data = organize.data;
  const locations = data?.locations ?? [];
  const [chosen, setChosen] = useState('');
  const location = locations.some((row) => row.location === chosen) ? chosen : locations[0]?.location ?? '';
  const stored = data?.templates?.[location];
  /* 两个框在人动过之前跟着存下的模板走：换来源就换成那个来源上次用的那两行。 */
  const [draft, setDraft] = useState<{ location: string; file: string; dir: string } | null>(null);
  const fields = draft?.location === location ? draft : { location, file: stored?.file ?? '', dir: stored?.dir ?? '' };
  const edit = (patch: Partial<{ file: string; dir: string }>) => { setDraft({ ...fields, ...patch }); preview.reset() };
  const [scope, setScope] = useState({ location: '', path: '' });
  const path = scope.location === location ? scope.path : '';
  const scopeRef = useRef({ location, path });
  scopeRef.current = { location, path };
  const [invalid, setInvalid] = useState<'file' | 'dir' | 'path' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dirInput = useRef<HTMLInputElement>(null);
  const pathInput = useRef<HTMLInputElement>(null);
  const example = useQuery({
    queryKey: ['organize-example', fields.file, fields.dir],
    queryFn: ({ signal }) => fetchOrganizeExample(fields.file, fields.dir, signal),
    enabled: Boolean(data),
  });
  const [target, setTarget] = useState<'file' | 'dir'>('file');
  const focused = useRef(false);
  const insertion = useRef<{ field: 'file' | 'dir'; caret: number } | null>(null);
  useLayoutEffect(() => {
    const next = insertion.current;
    if (!next) return;
    insertion.current = null;
    const input = (next.field === 'file' ? fileInput : dirInput).current;
    input?.focus();
    input?.setSelectionRange(next.caret, next.caret);
  });

  const request = () => ({ location, path: path.trim(), file_template: fields.file.trim(), dir_template: fields.dir.trim() });
  const preview = useMutation({
    mutationFn: previewOrganize,
    /* 模板不合法时错误就出在两个框里的一个，所以除了说原因还要指出是哪一格。 */
    onError: (cause) => {
      const target = /整理路径/.test(errorMessage(cause)) ? 'path'
        : DIRECTORY_TEMPLATE_ERROR.test(errorMessage(cause)) ? 'dir' : 'file';
      setInvalid(target);
      (target === 'path' ? pathInput : target === 'dir' ? dirInput : fileInput).current?.focus();
    },
  });
  const picker = useMutation({
    mutationFn: ({ initial }: { initial: string; location: string; path: string }) => pickOrganizeFolder(initial),
    onSuccess: (picked, sent) => {
      if (!picked.path || sent.location !== scopeRef.current.location || sent.path !== scopeRef.current.path) return;
      setScope({ location: sent.location, path: picked.path });
      setInvalid(null); preview.reset();
      pathInput.current?.focus();
    },
  });
  const job = useBackgroundJob<OrganizeJob, OrganizeCommand, OrganizeData>({
    queryKey: ORGANIZE_KEY,
    queryFn: ({ signal }) => fetchOrganize(signal),
    start: startOrganize,
    jobOf: (current) => current,
    withJob: withOrganizeJob,
    onStarted: () => preview.reset(),
    onFinish: (finished) => {
      /* 上一批跟着这一趟变了：执行多出一批，回滚退掉一批。重读一次拿到新的 `last_batch`。 */
      void queryClient.invalidateQueries({ queryKey: ORGANIZE_KEY, exact: true });
      if (finished.status !== 'complete') return;
      const { text, failed } = organizeOutcome(finished);
      if (failed) failure('整理文件', new Error(`${failed} 行未能处理`));
      else toast(text.replace(/。$/, ''));
    },
  });

  const running = job.running || job.start.isPending;
  const previewMatches = JSON.stringify(preview.variables) === JSON.stringify(request());
  const plan = previewMatches ? preview.data : undefined;
  const changes = Number(plan?.counts?.change || 0);
  const name = LOC[location] || location;
  const changeTemplates = (patch: Partial<{ file: string; dir: string }>) => {
    edit(patch); setInvalid(null); preview.reset();
  };
  const insertParameter = (key: string) => {
    const input = (target === 'file' ? fileInput : dirInput).current;
    const value = fields[target];
    const start = focused.current ? input?.selectionStart ?? value.length : value.length;
    const end = focused.current ? input?.selectionEnd ?? start : start;
    const token = `{${key}}`;
    insertion.current = { field: target, caret: start + token.length };
    changeTemplates({ [target]: value.slice(0, start) + token + value.slice(end) });
  };

  const runPreview = () => {
    if (preview.isPending || running || !location) return;
    job.dismiss(); job.start.reset();
    setInvalid(null);
    preview.mutate(request());
  };
  const runApply = () => {
    const sent = preview.variables;
    if (!sent || !plan || !changes) return;
    void confirmModal({
      title: '整理文件', body: APPLY_BODY(name, sent.path), confirmLabel: '整理文件',
      /* 确认执行时保存该来源的模板。 */
      onConfirm: async () => {
        await job.start.mutateAsync({ kind: 'apply', request: sent });
        void rememberTemplates({
          ...(data?.templates ?? {}), [sent.location]: { file: sent.file_template, dir: sent.dir_template },
        });
      },
    });
  };
  /* 历史批次：服务端列表最新在前；老数据没有列表时退回只认上一批。 */
  const batches = data?.batches?.length ? data.batches : data?.last_batch ? [data.last_batch] : [];
  const [batchChoice, setBatchChoice] = useState('');
  const selectedBatch = batches.includes(batchChoice) ? batchChoice : batches[0] ?? '';
  const runRollback = () => {
    if (!selectedBatch) return;
    void confirmModal({
      title: '回滚整理批次', body: ROLLBACK_BODY(selectedBatch), confirmLabel: '回滚整理',
      onConfirm: () => job.start.mutateAsync({ kind: 'rollback', batch: selectedBatch }),
    });
  };

  /* 我的方案：把当前两份模板连名字存进设置，之后一键填回。整表回写，写失败报出来。 */
  const schemes = data?.schemes ?? [];
  const [schemeName, setSchemeName] = useState('');
  const [schemeBusy, setSchemeBusy] = useState(false);
  const applyScheme = (scheme: OrganizeScheme) => {
    changeTemplates({ file: scheme.file, dir: scheme.dir });
    focused.current = false;
  };
  const saveSchemes = async (next: OrganizeScheme[], done: string) => {
    setSchemeBusy(true);
    try {
      await saveOrganizeSchemes(next);
      toast(done);
    } catch (cause) {
      failure('保存命名方案', cause);
    } finally {
      setSchemeBusy(false);
    }
  };
  const saveScheme = () => {
    const name = schemeName.trim();
    if (!name || schemeBusy) return;
    if (!fields.file.trim() && !fields.dir.trim()) {
      failure('保存命名方案', new Error('当前两份模板都是空的，没有可存的内容'));
      return;
    }
    const next = [...schemes.filter((scheme) => scheme.name !== name),
      { name, file: fields.file.trim(), dir: fields.dir.trim() }];
    setSchemeName('');
    void saveSchemes(next, `已保存方案「${name}」`);
  };
  const removeScheme = (name: string) => {
    if (schemeBusy) return;
    void saveSchemes(schemes.filter((scheme) => scheme.name !== name), `已删除方案「${name}」`);
  };

  /* 这张卡上的结论只有一句：跑着的那一趟、这次跟完的那一趟、刚出的预览，按新旧取最新。 */
  let state = null;
  const applicable = !!changes && !running && !job.outcome;
  const current = job.job;
  const outcome = job.outcome;
  if (current?.status === 'running') {
    const line = current.message || current.stage || '正在整理文件';
    state = <TaskProgress embedded label={line} value={Math.min(current.checked || 0, current.total || 0)} total={current.total} />;
  } else if (outcome?.status === 'failed') {
    state = <Note tone="error" title="文件整理未完成">{outcome.error || '请查看任务记录，核对已处理的文件。'}</Note>;
  } else if (outcome) {
    const { text, failed } = organizeOutcome(outcome);
    state = <Note tone={failed ? 'warning' : 'success'} title={failed ? '部分完成' : '整理结果'}>{text}</Note>;
  } else if (job.start.isError) {
    state = <Note tone="error" title="整理失败">{errorMessage(job.start.error)}</Note>;
  } else if (preview.isPending) {
    state = <TaskProgress embedded label="正在核对整理计划" />;
  } else if (preview.isError && previewMatches) {
    state = <Note tone="error" title="整理预览失败">{errorMessage(preview.error)}</Note>;
  } else if (plan) {
    state = <><Note tone="neutral" title="预览结果">{planSummary(plan)}</Note>{changes ? <PlanRows plan={plan} /> : null}</>;
  }

  return (
    <Fieldset layout="stack" id="organize" labelledBy="cleanup-organize-title"
      attributes={{ 'data-cleanup-organize': '' }}
      footer={
        <>
          {batches.length
            ? <>
                <Select aria-label="回滚哪个批次" className="w-fit" selectedKey={selectedBatch || null}
                  onSelectionChange={(key) => { if (key !== null) setBatchChoice(String(key)) }}>
                  {batches.map((batch) => (
                    <SelectItem key={batch} id={batch} textValue={batch}>{batch}</SelectItem>
                  ))}
                </Select>
                <Button variant="secondary" {...busyProps(running)} onClick={runRollback}>回滚所选批次</Button>
              </>
            : null}
          <Button variant={applicable ? 'secondary' : 'primary'} disabled={!locations.length || running}
            {...busyProps(preview.isPending)} onClick={runPreview}>预览</Button>
          {applicable ? <Button variant="primary" onClick={runApply}>执行整理</Button> : null}
        </>
      }>
      <FieldsetTitle id="cleanup-organize-title" gap="medium">整理</FieldsetTitle>
      <p className="text-body-regular text-text-secondary">
        清理文件名中的特殊符号与乱码，也可按模板改名并归入目录。先预览，确认后执行；执行过的一批可以整批退回。
      </p>
      {organize.isError
        ? <div className="mt-3"><Note tone="error" title="整理配置读取失败">{errorMessage(organize.error)}</Note></div>
        : null}
      <div className="mt-3 flex flex-col gap-3">
        <div data-organize-scope className="flex min-w-0 flex-wrap items-start gap-2">
        {locations.length
          ? <Select aria-label="整理哪个来源" prefix="来源" className="w-fit min-w-25" selectedKey={location || null}
              onSelectionChange={(key) => {
                if (key === null) return;
                setChosen(String(key)); setScope({ location: String(key), path: '' });
                setInvalid(null); preview.reset(); picker.reset(); focused.current = false;
              }}>
              {locations.map((row) => (
                <SelectItem key={row.location} id={row.location} textValue={LOC[row.location] || row.location}>
                  <SourceMark mark={MEDIA_SOURCE_ICONS[row.location] || 'database'} />{LOC[row.location] || row.location}
                </SelectItem>
              ))}
            </Select>
          : null}
          <div className="flex min-w-0 basis-64 flex-1 items-start gap-2">
            <Input aria-label="整理路径" className="min-w-0 flex-1" placeholder="留空整理整个来源"
              name="organize-path" autoComplete="off" spellCheck="false" value={path} ref={pathInput}
              isInvalid={invalid === 'path'}
              onChange={(value) => { setScope({ location, path: value }); setInvalid(null); preview.reset(); picker.reset() }} />
            <IconButton icon={FolderSearchIcon} aria-label="选择整理路径" {...busyProps(picker.isPending)}
              onClick={() => picker.mutate({ initial: path || locations.find((row) => row.location === location)?.roots[0] || '', location, path })} />
          </div>
        </div>
        <p className="text-caption-1-regular text-text-secondary">指定路径时包含子目录，目录模板以该路径为起点。模板均留空时只清理文件名。</p>
        {picker.isError ? <Note tone="error" title="目录选择失败">{errorMessage(picker.error)}；也可直接输入路径。</Note> : null}
        <Input label="文件名模板" placeholder="{code}[ {title}]" value={fields.file} ref={fileInput}
          spellCheck="false" isInvalid={invalid === 'file'}
          onFocus={() => { setTarget('file'); focused.current = true }}
          onChange={(value) => changeTemplates({ file: value })} />
        <Input label="目录模板" placeholder="留空表示原地改名" value={fields.dir} ref={dirInput}
          spellCheck="false" isInvalid={invalid === 'dir'}
          onFocus={() => { setTarget('dir'); focused.current = true }}
          onChange={(value) => changeTemplates({ dir: value })} />
        {data?.presets?.length
          ? <div className="flex flex-col gap-2" role="group" aria-label="套用模板">
              <p className="text-caption-1-medium text-text-secondary">套用模板</p>
              <div className="flex flex-wrap gap-2">
              {data.presets.map((preset) => (
                <Button key={preset.label} variant="secondary" size="small" title={preset.example || preset.label}
                  className="max-w-full [&>span]:min-w-0 [&>span]:shrink"
                  onClick={() => { changeTemplates({ file: preset.file, dir: preset.dir }); focused.current = false }}>
                  <span className="truncate">{preset.label}</span>
                </Button>
              ))}
              </div>
            </div>
          : null}
        <div className="flex flex-col gap-2" role="group" aria-label="我的方案">
          <p className="text-caption-1-medium text-text-secondary">我的方案</p>
          {schemes.length
            ? <div className="flex flex-wrap gap-2">
                {schemes.map((scheme) => (
                  <span key={scheme.name} className="inline-flex items-center gap-1">
                    <Button variant="secondary" size="small" title={`${scheme.file}${scheme.dir ? ` / ${scheme.dir}` : ''}`}
                      className="max-w-full [&>span]:min-w-0 [&>span]:shrink"
                      onClick={() => applyScheme(scheme)}>
                      <span className="truncate">{scheme.name}</span>
                    </Button>
                    <Button variant="ghost" size="small" aria-label={`删除方案「${scheme.name}」`}
                      {...busyProps(schemeBusy)} onClick={() => removeScheme(scheme.name)}>删除</Button>
                  </span>
                ))}
              </div>
            : null}
          <div className="flex min-w-0 flex-wrap items-start gap-2">
            <Input aria-label="方案名称" placeholder="给当前模板起个名字" className="min-w-0 basis-48 flex-1"
              name="organize-scheme-name" autoComplete="off" value={schemeName}
              onChange={(value) => setSchemeName(value)} />
            <Button variant="secondary" size="small" disabled={!schemeName.trim()}
              {...busyProps(schemeBusy)} onClick={saveScheme}>保存当前为方案</Button>
          </div>
        </div>
        <p aria-live="polite" aria-busy={example.isFetching} data-organize-example=""
          className="text-caption-1-regular text-text-secondary">
          路径示例：<code className="wrap-anywhere">{example.data?.example || example.data?.error
            || (example.isError ? errorMessage(example.error) : '正在预览…')}</code>
        </p>
        {data?.placeholders?.length ? <div className="flex flex-col gap-2" role="group" aria-label="插入参数">
          <p className="text-caption-1-regular text-text-secondary" aria-live="polite">
            <strong className="text-caption-1-semibold text-text-primary">插入参数</strong>（到{target === 'file' ? '文件名模板' : '目录模板'}）
          </p>
          <div className="flex flex-wrap gap-1">
            {data.placeholders.map((item) => <Button key={item.key} variant="ghost" size="small"
              aria-label={`${item.label} {${item.key}}`} onClick={() => insertParameter(item.key)}>
              <span className="inline-flex flex-wrap items-center gap-x-1.5">
                <code>{`{${item.key}}`}</code><span className="text-text-secondary">{item.label}</span>
              </span>
            </Button>)}
          </div>
        </div> : null}
        <p className="text-caption-1-regular leading-4.5 text-text-secondary">
          点击参数插入光标处，选中文字可替换。方括号里的内容在字段为空时整段省略。
        </p>
      </div>
      <div aria-live="polite" className="mt-3 flex flex-col gap-2 empty:hidden">{state}</div>
    </Fieldset>
  );
}
