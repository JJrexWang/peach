(function() {
	try {
		var e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, t = new e.Error().stack;
		t && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[t] = "2aa3c6eb-4c86-4bb0-85b3-1e77730aae2f", e._sentryDebugIdIdentifier = "sentry-dbid-2aa3c6eb-4c86-4bb0-85b3-1e77730aae2f");
	} catch {}
})();
import { Button as e, Chip as t, DIRECTORY_TEMPLATE_ERROR as n, DUPLICATES_KEY as r, Fieldset as i, FieldsetTitle as a, IDLE_REPAIR as o, IconButton as s, Input as c, JUNK_KEY as l, LINKS_KEY as u, LINK_CHECK_KEY as d, LINK_KINDS as f, LINK_PRUNE_KEY as p, LOC as m, LibraryProcessingCard as h, MEDIA_REPAIR_KEY as g, MEDIA_REPAIR_URL as _, MEDIA_SOURCES_KEY as v, MEDIA_SOURCE_ICONS as y, Note as b, ORGANIZE_KEY as x, ORPHAN_RECORDS_KEY as S, Progress as C, QUALITY_GOALS_KEY as w, REPAIR_CARD_TEXT as T, REPAIR_LIBRARIES_KEY as E, RESOURCE_APPLY_KEY as D, RESOURCE_SCAN_KEY as O, RESULT_PANEL as ee, RESULT_SECTION as k, REVIEW_COUNTS_KEY as A, SOURCE_LABELS as j, Select as M, SelectItem as te, SourceMark as N, StatusLabel as P, TRASH_KEY as ne, TaskProgress as re, Wt as F, __toESM as ie, apiSend as ae, applyConfirmText as I, applyLeftovers as L, applyPlanText as R, applyText as oe, attachOrphan as se, baseName as z, busyProps as B, candidateText as ce, checkLine as le, confirmModal as V, entityFaceImg as H, entityPath as ue, errorMessage as U, esc as de, fetchDuplicates as fe, fetchJunkSummary as pe, fetchLinkCheck as me, fetchLinkPrune as he, fetchLinkStats as ge, fetchMediaRepair as _e, fetchMediaSources as ve, fetchOrganize as ye, fetchOrganizeExample as be, fetchOrphanRecords as xe, fetchQualityGoals as Se, fetchRepairLibraries as Ce, fetchResourceApply as we, fetchResourceScan as Te, fetchReviewCounts as Ee, fetchTrashSummary as De, firstGrapheme as Oe, fmtSize as W, hasChanges as ke, hasResourceRoots as G, junkBreakdown as Ae, missingToolText as je, organizeOutcome as Me, pickOrganizeFolder as Ne, planSummary as Pe, previewOrganize as Fe, pruneText as Ie, purgeCount as Le, purgeOrphan as Re, queryClient as K, recordsText as ze, rememberTemplates as Be, require_jsx_runtime as Ve, require_react as He, reviewSummary as Ue, saveOrganizeSchemes as We, scanLine as Ge, sourceMeta as Ke, spriteGlyph as q, startLinkCheck as qe, startLinkPrune as Je, startOrganize as Ye, startResourceApply as Xe, startResourceScan as Ze, statusLine as Qe, useAction as $e, useBackgroundJob as J, useMutation as et, useQuery as Y, withOrganizeJob as tt } from "./peach-app.js";
import { Page as nt } from "./peach-app.page-QAncjzM1.js";
import { ErrorExcerpt as rt } from "./peach-app.error-excerpt-B8v2xEIP.js";
import { PLAIN_STAT_STRIP as it, PlainStat as X, plainStatClass as at } from "./peach-app.stat-card-DsNmy_0F.js";
import { DataTable as ot } from "./peach-app.data-table-BUBc51R4.js";
import { SiteMark as st } from "./peach-app.site-mark-D_VlIyJz.js";
import { LEGACY_AVATAR_IMG as ct } from "./peach-app.legacy-avatar-NSITxLRS.js";
import { FolderSearchIcon as lt } from "./peach-app.folder-rows-BWBfTyUD.js";
import { ConnectionStatus as ut } from "./peach-app.connection-status-DI6kgn3i.js";
// src/react/media-repair/media-repair-card.tsx
var Z = /* @__PURE__ */ ie(He(), 1), Q = Ve(), dt = (e) => y[e] || e, ft = (e) => K.setQueryData(g, e);
function pt({ toast: t = () => {} }) {
	let n = J({
		queryKey: g,
		queryFn: ({ signal: e }) => _e(e),
		start: (e) => ae(_, {
			library: e,
			restart: !0
		}),
		onFinish: (e) => {
			e.status === "complete" && !e.failed && !e.missing_tool && t(e.repaired ? `已修复 ${e.repaired.toLocaleString()} 部视频` : "已检查媒体库，没有需要修复的视频");
		}
	}), r = Y({
		queryKey: E,
		queryFn: ({ signal: e }) => Ce(e)
	}), [s, c] = (0, Z.useState)(""), l = $e(), u = n.job ?? o, d = r.data ?? [], f = u.status === "running", p = d.find((e) => e.id === (f ? u.library : s)) ?? d.find((e) => e.id === u.library) ?? d[0], m = () => {
		p && V({
			title: `修复媒体库「${p.name}」`,
			body: "缺时间戳表的片子另存一份修好的头，原文件不动；缺索引的片子重建后替换原文件，坏原件改名成同目录的隐藏文件（.文件名.peach-original）留着。" + (p.metered ? "这个库在计费来源上，每修一部都要把片子完整拉一遍。" : ""),
			confirmLabel: "修复媒体库",
			onConfirm: async () => {
				await n.start.mutateAsync(p.id);
			}
		});
	}, h = () => void l.run("stop", (e) => ae(_, { stop: !0 }, "POST", e), ft), v = n.outcome, y = Qe(f ? u : v ?? o), x = l.error || v?.error || (n.query.error ? "读不到媒体修复的状态" : "");
	return /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsx)(i, {
			layout: "split",
			label: "媒体修复",
			footer: /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(M, {
				"aria-label": "媒体库",
				prefix: "媒体库",
				className: "w-48",
				selectedKey: p?.id ?? null,
				isDisabled: f || !d.length,
				onSelectionChange: (e) => {
					e !== null && c(String(e));
				},
				children: d.map((e) => /* @__PURE__ */ (0, Q.jsxs)(te, {
					id: e.id,
					textValue: e.name,
					children: [/* @__PURE__ */ (0, Q.jsx)(N, { mark: dt(e.icon) }), e.name]
				}, e.id))
			}), f ? /* @__PURE__ */ (0, Q.jsx)(e, {
				onClick: h,
				...B(l.busy === "stop"),
				children: "停止"
			}) : /* @__PURE__ */ (0, Q.jsx)(e, {
				onClick: m,
				disabled: !p,
				children: "开始修复"
			})] }),
			children: /* @__PURE__ */ (0, Q.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, Q.jsx)(a, { children: "媒体修复" }),
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-body-2-regular text-text-secondary",
						children: T
					}),
					f && u.total ? /* @__PURE__ */ (0, Q.jsx)(C, {
						label: "修复进度",
						value: u.checked,
						max: u.total
					}) : null,
					y ? /* @__PURE__ */ (0, Q.jsx)("p", {
						role: "status",
						className: "text-caption-1-regular text-text-secondary",
						children: y
					}) : null
				]
			})
		}), /* @__PURE__ */ (0, Q.jsxs)("div", {
			"aria-live": "polite",
			className: "flex flex-col gap-4 empty:hidden",
			children: [v?.status === "complete" && v.missing_tool ? /* @__PURE__ */ (0, Q.jsx)(b, {
				tone: "warning",
				title: "缺少 untrunc",
				action: /* @__PURE__ */ (0, Q.jsx)(e, {
					variant: "ghost",
					size: "small",
					onClick: n.dismiss,
					children: "关闭提示"
				}),
				children: je(v)
			}) : null, x ? /* @__PURE__ */ (0, Q.jsx)(b, {
				tone: "error",
				children: x
			}) : null]
		})]
	});
}
// src/react/data-cleanup/link-check-icon.tsx
function mt({ className: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)("svg", {
		"aria-hidden": !0,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className: e,
		"data-link-check-icon": "",
		children: [
			/* @__PURE__ */ (0, Q.jsx)("path", { d: "m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" }),
			/* @__PURE__ */ (0, Q.jsx)("path", { d: "m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" }),
			/* @__PURE__ */ (0, Q.jsxs)("g", {
				"data-link-check-rays": "",
				children: [
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M8 2v3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M2 8h3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M16 19v3" }),
					/* @__PURE__ */ (0, Q.jsx)("path", { d: "M19 16h3" })
				]
			})
		]
	});
}
// src/react/data-cleanup/link-manager.tsx
var ht = q("rotate-cw"), gt = "站点返回 404 或 410，确认这个地址不存在。", _t = "站点拒绝程序访问或一次临时故障都会落在这里。链接保留，可勾选后单独重试。", vt = "删除前会逐条重验一次；此操作不可撤销。", yt = "暂时无法读取进度，正在重新连接…", bt = (e) => Number(e || 0).toLocaleString();
function xt({ label: e, value: t, note: n }) {
	return /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-0.5",
		children: [
			/* @__PURE__ */ (0, Q.jsx)("span", {
				className: "text-caption-1-regular leading-5 text-text-secondary",
				children: e
			}),
			/* @__PURE__ */ (0, Q.jsx)("b", {
				className: "text-title-2-semibold font-bold leading-5 tabular-nums text-text-primary",
				children: t
			}),
			n ? /* @__PURE__ */ (0, Q.jsx)("small", {
				className: "text-caption-1-regular leading-5 text-text-secondary",
				children: n
			}) : null
		]
	});
}
function St({ title: e, items: t, hint: n, picked: r, onPick: i, children: a, footer: o, confirmed: s = !1 }) {
	return t.length ? /* @__PURE__ */ (0, Q.jsx)("div", {
		className: k,
		"data-link-results": s ? "gone" : "unclear",
		children: /* @__PURE__ */ (0, Q.jsx)(ot, {
			label: e,
			items: t,
			columns: [
				{
					id: "entity",
					label: "Peach 资料",
					width: 180,
					min: 128,
					value: (e) => e.entity,
					render: (e) => /* @__PURE__ */ (0, Q.jsxs)("a", {
						className: "flex min-w-24 items-center gap-2 text-text-secondary hover:text-text-primary hover:underline",
						href: e.entity_id && e.entity_kind ? ue(e.entity_kind, e.entity, e.entity_id) : void 0,
						"data-link-identity": "",
						children: [/* @__PURE__ */ (0, Q.jsx)("span", {
							"data-link-avatar": "",
							className: `relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-quaternary-default text-caption-1-medium text-text-primary ${ct}`,
							"aria-hidden": !0,
							dangerouslySetInnerHTML: { __html: `<span>${de(Oe(e.entity))}</span>` + H({
								kind: e.entity_kind,
								id: e.entity_id,
								hasImage: e.face?.has_image,
								version: e.face?.image_version,
								focus: e.face?.avatar_focus,
								thumb: !0,
								mark: e.entity_kind === "studio" || e.entity_kind === "agency" ? e.id : null
							}) }
						}), /* @__PURE__ */ (0, Q.jsx)("span", {
							className: "min-w-0 wrap-anywhere",
							children: e.entity
						})]
					})
				},
				{
					id: "kind",
					label: "类型",
					width: 128,
					value: (e) => f[e.link_kind] || e.link_kind,
					render: (e) => f[e.link_kind] || e.link_kind
				},
				{
					id: "label",
					label: "链接名称",
					min: 128,
					value: (e) => e.label || "",
					render: (e) => /* @__PURE__ */ (0, Q.jsx)("span", {
						className: "flex min-w-24 items-center gap-2",
						"data-link-name": "",
						children: /* @__PURE__ */ (0, Q.jsx)("span", {
							className: "min-w-0 wrap-anywhere",
							children: e.label || new URL(e.url).hostname
						})
					})
				},
				{
					id: "note",
					label: "结果",
					width: 320,
					min: 192,
					value: (e) => e.note,
					render: (e) => /* @__PURE__ */ (0, Q.jsx)("div", {
						className: "min-w-0 w-full",
						"data-link-result": s ? "gone" : "unclear",
						children: /^(?:HTTP\s+)?[1-5]\d{2}$/.test(e.note.trim()) ? /* @__PURE__ */ (0, Q.jsx)(P, {
							tone: s || /^(?:HTTP\s+)?5\d{2}$/.test(e.note.trim()) ? "error" : "warning",
							"data-link-code": "",
							children: e.note.trim()
						}) : /* @__PURE__ */ (0, Q.jsxs)("div", {
							className: "flex flex-col items-start gap-1",
							children: [/* @__PURE__ */ (0, Q.jsx)(P, {
								tone: s ? "error" : "warning",
								children: s ? "地址已失效" : "未取得结论"
							}), /* @__PURE__ */ (0, Q.jsx)(rt, {
								text: e.note,
								className: "tabular-nums text-text-secondary"
							})]
						})
					})
				},
				{
					id: "url",
					label: "地址",
					width: 360,
					min: 180,
					value: (e) => e.url,
					render: (e) => /* @__PURE__ */ (0, Q.jsxs)("a", {
						href: e.url,
						target: "_blank",
						rel: "noopener noreferrer",
						title: e.url,
						"data-link-address": "",
						className: "flex min-w-0 items-center gap-1 text-text-secondary hover:text-text-primary",
						children: [
							/* @__PURE__ */ (0, Q.jsx)(st, { linkId: e.id }),
							/* @__PURE__ */ (0, Q.jsx)("span", {
								"data-middle-truncate": !0,
								className: "min-w-0 truncate",
								children: e.url
							}),
							/* @__PURE__ */ (0, Q.jsx)(F, {
								"aria-hidden": !0,
								className: "size-(--icon-inline) shrink-0"
							})
						]
					})
				}
			],
			rowId: (e) => String(e.id),
			description: n,
			unit: "条链接",
			panel: !1,
			footerActions: o,
			rowLabel: (e) => `${e.entity} 的${e.label || e.url}`,
			selected: r.map(String),
			onSelected: (e) => i(e.map(Number)),
			actions: () => a
		})
	}) : null;
}
function Ct() {
	let n = Y({
		queryKey: u,
		queryFn: ({ signal: e }) => ge(e)
	}), [r, o] = (0, Z.useState)([]), [s, c] = (0, Z.useState)([]), l = J({
		queryKey: p,
		queryFn: ({ signal: e }) => he(e),
		start: Je,
		onFinish: () => {
			K.invalidateQueries({
				queryKey: u,
				exact: !0
			}), K.invalidateQueries({
				queryKey: d,
				exact: !0
			});
		}
	}), m = J({
		queryKey: d,
		queryFn: ({ signal: e }) => me(e),
		start: qe,
		onStarted: () => {
			l.dismiss(), o([]), c([]);
		}
	}), h = m.job, g = h?.check_id ?? "";
	(0, Z.useEffect)(() => {
		o([]), c([]);
	}, [g]);
	let _ = m.running || m.start.isPending, v = l.running || l.start.isPending, y = h?.status === "complete", x = h?.gone ?? [], S = h?.unclear ?? [], C = y ? S : [], w = x.filter((e) => s.includes(e.id)).map((e) => e.id), T = C.filter((e) => r.includes(e.id)).map((e) => e.id), E = n.data, D = (E?.top_hosts ?? []).slice(0, 3), O = (e) => {
		_ || e && !e.length || m.start.mutate(e ? {
			retry: e,
			checkId: g
		} : {});
	}, A = (e) => {
		!v && x.length && V({
			title: "删除失效链接",
			body: `将删除 ${e?.length ?? x.length} 条失效链接。删除前会再次检查，删除后无法恢复。`,
			confirmLabel: "删除失效链接",
			danger: !0,
			onConfirm: () => l.start.mutateAsync({
				checkId: g,
				ids: e
			})
		});
	}, j = l.outcome, M = m.start.error ?? l.start.error, te = null, N = null;
	if (j?.status === "failed") N = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "链接清理未完成",
		children: j.error || "请查看任务记录，核对已处理的链接。"
	});
	else if (j && !x.length && !S.length) N = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "success",
		title: "完成",
		children: Ie(j)
	});
	else if (M) N = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "检查失败",
		children: U(M)
	});
	else if (m.query.isError && h) N = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: "任务状态",
		children: yt
	});
	else if (h?.status === "failed") N = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "检查失败",
		children: h.error || "检查失败"
	});
	else if (h && h.status !== "idle") {
		te = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [h.status === "running" ? /* @__PURE__ */ (0, Q.jsx)(re, {
			embedded: !0,
			label: le(h),
			value: Math.min(h.checked || 0, h.total || 0),
			total: h.total
		}) : null, v ? /* @__PURE__ */ (0, Q.jsx)(re, {
			embedded: !0,
			label: l.job?.message || "正在重验并删除失效链接",
			value: Math.min(l.job?.checked || 0, l.job?.total || 0),
			total: l.job?.total
		}) : null] });
		let t = `立即重试所选（${T.length}）`;
		N = y || x.length || S.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
			className: ee,
			children: [
				j?.status === "complete" ? /* @__PURE__ */ (0, Q.jsx)(b, {
					tone: "success",
					title: "完成",
					children: Ie(j)
				}) : null,
				/* @__PURE__ */ (0, Q.jsx)(St, {
					title: "地址已失效",
					items: x,
					hint: gt,
					picked: s,
					onPick: c,
					confirmed: !0,
					footer: y && x.length ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "mr-auto min-w-0 text-caption-1-regular text-text-secondary",
						children: vt
					}), /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "danger",
						...B(v),
						onClick: () => A(),
						children: `删除 ${x.length} 条失效链接`
					})] }) : null,
					children: /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "danger",
						size: "small",
						disabled: !y || !w.length,
						...B(v),
						onClick: () => A(w),
						children: `删除所选（${w.length}）`
					})
				}),
				/* @__PURE__ */ (0, Q.jsx)(St, {
					title: "本次未访问成功",
					items: S,
					hint: _t,
					picked: r,
					onPick: o,
					footer: C.length ? /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "primary",
						leadingIcon: ht,
						...B(_),
						onClick: () => O(C.map((e) => e.id)),
						children: `立即重试全部（${C.length}）`
					}) : null,
					children: C.length ? /* @__PURE__ */ (0, Q.jsx)(Q.Fragment, { children: /* @__PURE__ */ (0, Q.jsx)(e, {
						variant: "secondary",
						leadingIcon: ht,
						disabled: !T.length,
						...B(_),
						onClick: () => O(T),
						children: t
					}) }) : null
				}),
				y && !x.length && !S.length ? /* @__PURE__ */ (0, Q.jsx)("p", {
					className: `${k} text-body-regular text-notification-success-foreground`,
					children: "全部链接均可访问。"
				}) : null
			]
		}) : null;
	}
	return /* @__PURE__ */ (0, Q.jsxs)("section", {
		id: "link-manager",
		"aria-labelledby": "link-manager-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsxs)(i, {
			layout: "stack",
			labelledBy: "link-manager-title",
			footer: /* @__PURE__ */ (0, Q.jsx)(e, {
				"data-link-check": "",
				leadingIcon: mt,
				...B(_),
				onClick: () => O(),
				children: _ ? "检查中" : y ? "重新检查" : "检查死链"
			}),
			children: [
				/* @__PURE__ */ (0, Q.jsx)(a, {
					id: "link-manager-title",
					gap: "small",
					children: "链接管理"
				}),
				n.isError ? /* @__PURE__ */ (0, Q.jsx)(b, {
					tone: "error",
					title: "链接统计读取失败",
					children: U(n.error)
				}) : E ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "link-stat-grid mt-4 gap-x-8 gap-y-3",
					children: [/* @__PURE__ */ (0, Q.jsx)(xt, {
						label: "链接总数",
						value: bt(E.total),
						note: `分布在 ${bt(E.entities)} 个女优、厂牌与系列`
					}), Object.entries(E.by_kind ?? {}).map(([e, t]) => /* @__PURE__ */ (0, Q.jsx)(xt, {
						label: f[e] || e,
						value: bt(t)
					}, e))]
				}), D.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
					className: "mt-4 flex min-w-0 flex-col gap-0.5",
					children: [/* @__PURE__ */ (0, Q.jsx)("span", {
						className: "text-caption-1-regular text-text-secondary",
						children: "主要站点"
					}), /* @__PURE__ */ (0, Q.jsx)("div", {
						className: "flex min-w-0 flex-wrap gap-x-5 gap-y-2",
						children: D.map(([e, n]) => /* @__PURE__ */ (0, Q.jsxs)("span", {
							"data-top-host": "",
							className: "inline-flex min-w-0 max-w-full items-center gap-1.5",
							children: [/* @__PURE__ */ (0, Q.jsxs)("a", {
								href: `https://${e}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex min-w-0 items-center gap-1.5 text-body-2-medium text-text-primary",
								children: [
									/* @__PURE__ */ (0, Q.jsx)(st, { linkId: E.top_host_link_ids?.[e] }),
									/* @__PURE__ */ (0, Q.jsx)("span", {
										className: "min-w-0 wrap-anywhere",
										children: e
									}),
									/* @__PURE__ */ (0, Q.jsx)(F, {
										"aria-hidden": !0,
										className: "size-(--icon-inline) shrink-0"
									})
								]
							}), /* @__PURE__ */ (0, Q.jsx)(t, {
								variant: "caption",
								color: "neutral",
								children: /* @__PURE__ */ (0, Q.jsx)("span", {
									className: "tabular-nums",
									children: bt(n)
								})
							})]
						}, e))
					})]
				}) : null] }) : null,
				/* @__PURE__ */ (0, Q.jsx)("div", {
					"aria-live": "polite",
					className: "mt-4 flex flex-col gap-3 empty:hidden",
					children: te
				})
			]
		}), /* @__PURE__ */ (0, Q.jsx)("div", {
			"aria-live": "polite",
			className: "empty:hidden",
			children: N
		})]
	});
}
// src/react/data-cleanup/organize-card.tsx
var wt = (e, t) => `将整理「${e}」${t ? `的「${t}」及其子目录` : "上的文件名与目录"}，清理特殊符号与乱码，并按已填模板改名或移动。目标已存在的行会整行跳过。这一批会记进批次列表，之后可以整批退回。`, Tt = (e) => `将把批次「${e}」整理动过的文件退回整理前的名字与位置，数据库路径跟着退回。退回后这一批不再出现在这里。`, Et = 8;
function Dt({ plan: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("ol", {
		className: "mt-2 flex min-w-0 flex-col gap-1",
		children: e.rows.slice(0, Et).map((e) => /* @__PURE__ */ (0, Q.jsxs)("li", {
			className: "flex min-w-0 items-center gap-2 text-caption-1-regular text-text-secondary",
			children: [
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.current_path,
					className: "min-w-0 truncate",
					children: z(e.current_path)
				}),
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"aria-hidden": !0,
					children: "→"
				}),
				/* @__PURE__ */ (0, Q.jsx)("span", {
					"data-middle-truncate": !0,
					title: e.target_path,
					className: "min-w-0 truncate text-text-primary",
					children: z(e.target_path)
				})
			]
		}, e.current_path))
	}), e.truncated || e.rows.length > Et ? /* @__PURE__ */ (0, Q.jsx)("p", {
		className: "text-caption-1-regular text-text-secondary",
		children: "只列出前 8 行，完整计划在计划 CSV 里。"
	}) : null] });
}
function Ot({ toast: t, failure: r }) {
	let o = Y({
		queryKey: x,
		queryFn: ({ signal: e }) => ye(e)
	}), l = o.data, u = l?.locations ?? [], [d, f] = (0, Z.useState)(""), p = u.some((e) => e.location === d) ? d : u[0]?.location ?? "", h = l?.templates?.[p], [g, _] = (0, Z.useState)(null), v = g?.location === p ? g : {
		location: p,
		file: h?.file ?? "",
		dir: h?.dir ?? ""
	}, S = (e) => {
		_({
			...v,
			...e
		}), I.reset();
	}, [C, w] = (0, Z.useState)({
		location: "",
		path: ""
	}), T = C.location === p ? C.path : "", E = (0, Z.useRef)({
		location: p,
		path: T
	});
	E.current = {
		location: p,
		path: T
	};
	let [D, O] = (0, Z.useState)(null), ee = (0, Z.useRef)(null), k = (0, Z.useRef)(null), A = (0, Z.useRef)(null), j = Y({
		queryKey: [
			"organize-example",
			v.file,
			v.dir
		],
		queryFn: ({ signal: e }) => be(v.file, v.dir, e),
		enabled: !!l
	}), [P, ne] = (0, Z.useState)("file"), F = (0, Z.useRef)(!1), ie = (0, Z.useRef)(null);
	(0, Z.useLayoutEffect)(() => {
		let e = ie.current;
		if (!e) return;
		ie.current = null;
		let t = (e.field === "file" ? ee : k).current;
		t?.focus(), t?.setSelectionRange(e.caret, e.caret);
	});
	let ae = () => ({
		location: p,
		path: T.trim(),
		file_template: v.file.trim(),
		dir_template: v.dir.trim()
	}), I = et({
		mutationFn: Fe,
		onError: (e) => {
			let t = /整理路径/.test(U(e)) ? "path" : n.test(U(e)) ? "dir" : "file";
			O(t), (t === "path" ? A : t === "dir" ? k : ee).current?.focus();
		}
	}), L = et({
		mutationFn: ({ initial: e }) => Ne(e),
		onSuccess: (e, t) => {
			e.path && t.location === E.current.location && t.path === E.current.path && (w({
				location: t.location,
				path: e.path
			}), O(null), I.reset(), A.current?.focus());
		}
	}), R = J({
		queryKey: x,
		queryFn: ({ signal: e }) => ye(e),
		start: Ye,
		jobOf: (e) => e,
		withJob: tt,
		onStarted: () => I.reset(),
		onFinish: (e) => {
			if (K.invalidateQueries({
				queryKey: x,
				exact: !0
			}), e.status !== "complete") return;
			let { text: n, failed: i } = Me(e);
			i ? r("整理文件", /* @__PURE__ */ Error(`${i} 行未能处理`)) : t(n.replace(/。$/, ""));
		}
	}), oe = R.running || R.start.isPending, se = JSON.stringify(I.variables) === JSON.stringify(ae()), z = se ? I.data : void 0, ce = Number(z?.counts?.change || 0), le = m[p] || p, H = (e) => {
		S(e), O(null), I.reset();
	}, ue = (e) => {
		let t = (P === "file" ? ee : k).current, n = v[P], r = F.current ? t?.selectionStart ?? n.length : n.length, i = F.current ? t?.selectionEnd ?? r : r, a = `{${e}}`;
		ie.current = {
			field: P,
			caret: r + a.length
		}, H({ [P]: n.slice(0, r) + a + n.slice(i) });
	}, de = () => {
		I.isPending || oe || !p || (R.dismiss(), R.start.reset(), O(null), I.mutate(ae()));
	}, fe = () => {
		let e = I.variables;
		e && z && ce && V({
			title: "整理文件",
			body: wt(le, e.path),
			confirmLabel: "整理文件",
			onConfirm: async () => {
				await R.start.mutateAsync({
					kind: "apply",
					request: e
				}), Be({
					...l?.templates ?? {},
					[e.location]: {
						file: e.file_template,
						dir: e.dir_template
					}
				});
			}
		});
	}, pe = l?.batches?.length ? l.batches : l?.last_batch ? [l.last_batch] : [], [me, he] = (0, Z.useState)(""), ge = pe.includes(me) ? me : pe[0] ?? "", _e = () => {
		ge && V({
			title: "回滚整理批次",
			body: Tt(ge),
			confirmLabel: "回滚整理",
			onConfirm: () => R.start.mutateAsync({
				kind: "rollback",
				batch: ge
			})
		});
	}, ve = l?.schemes ?? [], [xe, Se] = (0, Z.useState)(""), [Ce, we] = (0, Z.useState)(!1), Te = (e) => {
		H({
			file: e.file,
			dir: e.dir
		}), F.current = !1;
	}, Ee = async (e, n) => {
		we(!0);
		try {
			await We(e), t(n);
		} catch (e) {
			r("保存命名方案", e);
		} finally {
			we(!1);
		}
	}, De = () => {
		let e = xe.trim();
		if (!e || Ce) return;
		if (!v.file.trim() && !v.dir.trim()) {
			r("保存命名方案", /* @__PURE__ */ Error("当前两份模板都是空的，没有可存的内容"));
			return;
		}
		let t = [...ve.filter((t) => t.name !== e), {
			name: e,
			file: v.file.trim(),
			dir: v.dir.trim()
		}];
		Se(""), Ee(t, `已保存方案「${e}」`);
	}, Oe = (e) => {
		Ce || Ee(ve.filter((t) => t.name !== e), `已删除方案「${e}」`);
	}, W = null, ke = !!ce && !oe && !R.outcome, G = R.job, Ae = R.outcome;
	if (G?.status === "running") {
		let e = G.message || G.stage || "正在整理文件";
		W = /* @__PURE__ */ (0, Q.jsx)(re, {
			embedded: !0,
			label: e,
			value: Math.min(G.checked || 0, G.total || 0),
			total: G.total
		});
	} else if (Ae?.status === "failed") W = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "文件整理未完成",
		children: Ae.error || "请查看任务记录，核对已处理的文件。"
	});
	else if (Ae) {
		let { text: e, failed: t } = Me(Ae);
		W = /* @__PURE__ */ (0, Q.jsx)(b, {
			tone: t ? "warning" : "success",
			title: t ? "部分完成" : "整理结果",
			children: e
		});
	} else R.start.isError ? W = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "整理失败",
		children: U(R.start.error)
	}) : I.isPending ? W = /* @__PURE__ */ (0, Q.jsx)(re, {
		embedded: !0,
		label: "正在核对整理计划"
	}) : I.isError && se ? W = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "整理预览失败",
		children: U(I.error)
	}) : z && (W = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: "预览结果",
		children: Pe(z)
	}), ce ? /* @__PURE__ */ (0, Q.jsx)(Dt, { plan: z }) : null] }));
	return /* @__PURE__ */ (0, Q.jsxs)(i, {
		layout: "stack",
		id: "organize",
		labelledBy: "cleanup-organize-title",
		attributes: { "data-cleanup-organize": "" },
		footer: /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [
			pe.length ? /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(M, {
				"aria-label": "回滚哪个批次",
				className: "w-fit",
				selectedKey: ge || null,
				onSelectionChange: (e) => {
					e !== null && he(String(e));
				},
				children: pe.map((e) => /* @__PURE__ */ (0, Q.jsx)(te, {
					id: e,
					textValue: e,
					children: e
				}, e))
			}), /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "secondary",
				...B(oe),
				onClick: _e,
				children: "回滚所选批次"
			})] }) : null,
			/* @__PURE__ */ (0, Q.jsx)(e, {
				variant: ke ? "secondary" : "primary",
				disabled: !u.length || oe,
				...B(I.isPending),
				onClick: de,
				children: "预览"
			}),
			ke ? /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "primary",
				onClick: fe,
				children: "执行整理"
			}) : null
		] }),
		children: [
			/* @__PURE__ */ (0, Q.jsx)(a, {
				id: "cleanup-organize-title",
				gap: "medium",
				children: "整理"
			}),
			/* @__PURE__ */ (0, Q.jsx)("p", {
				className: "text-body-regular text-text-secondary",
				children: "清理文件名中的特殊符号与乱码，也可按模板改名并归入目录。先预览，确认后执行；执行过的一批可以整批退回。"
			}),
			o.isError ? /* @__PURE__ */ (0, Q.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, Q.jsx)(b, {
					tone: "error",
					title: "整理配置读取失败",
					children: U(o.error)
				})
			}) : null,
			/* @__PURE__ */ (0, Q.jsxs)("div", {
				className: "mt-3 flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, Q.jsxs)("div", {
						"data-organize-scope": !0,
						className: "flex min-w-0 flex-wrap items-start gap-2",
						children: [u.length ? /* @__PURE__ */ (0, Q.jsx)(M, {
							"aria-label": "整理哪个来源",
							prefix: "来源",
							className: "w-fit min-w-25",
							selectedKey: p || null,
							onSelectionChange: (e) => {
								e !== null && (f(String(e)), w({
									location: String(e),
									path: ""
								}), O(null), I.reset(), L.reset(), F.current = !1);
							},
							children: u.map((e) => /* @__PURE__ */ (0, Q.jsxs)(te, {
								id: e.location,
								textValue: m[e.location] || e.location,
								children: [/* @__PURE__ */ (0, Q.jsx)(N, { mark: y[e.location] || "database" }), m[e.location] || e.location]
							}, e.location))
						}) : null, /* @__PURE__ */ (0, Q.jsxs)("div", {
							className: "flex min-w-0 basis-64 flex-1 items-start gap-2",
							children: [/* @__PURE__ */ (0, Q.jsx)(c, {
								"aria-label": "整理路径",
								className: "min-w-0 flex-1",
								placeholder: "留空整理整个来源",
								name: "organize-path",
								autoComplete: "off",
								spellCheck: "false",
								value: T,
								ref: A,
								isInvalid: D === "path",
								onChange: (e) => {
									w({
										location: p,
										path: e
									}), O(null), I.reset(), L.reset();
								}
							}), /* @__PURE__ */ (0, Q.jsx)(s, {
								icon: lt,
								"aria-label": "选择整理路径",
								...B(L.isPending),
								onClick: () => L.mutate({
									initial: T || u.find((e) => e.location === p)?.roots[0] || "",
									location: p,
									path: T
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-caption-1-regular text-text-secondary",
						children: "指定路径时包含子目录，目录模板以该路径为起点。模板均留空时只清理文件名。"
					}),
					L.isError ? /* @__PURE__ */ (0, Q.jsxs)(b, {
						tone: "error",
						title: "目录选择失败",
						children: [U(L.error), "；也可直接输入路径。"]
					}) : null,
					/* @__PURE__ */ (0, Q.jsx)(c, {
						label: "文件名模板",
						placeholder: "{code}[ {title}]",
						value: v.file,
						ref: ee,
						spellCheck: "false",
						isInvalid: D === "file",
						onFocus: () => {
							ne("file"), F.current = !0;
						},
						onChange: (e) => H({ file: e })
					}),
					/* @__PURE__ */ (0, Q.jsx)(c, {
						label: "目录模板",
						placeholder: "留空表示原地改名",
						value: v.dir,
						ref: k,
						spellCheck: "false",
						isInvalid: D === "dir",
						onFocus: () => {
							ne("dir"), F.current = !0;
						},
						onChange: (e) => H({ dir: e })
					}),
					l?.presets?.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": "套用模板",
						children: [/* @__PURE__ */ (0, Q.jsx)("p", {
							className: "text-caption-1-medium text-text-secondary",
							children: "套用模板"
						}), /* @__PURE__ */ (0, Q.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: l.presets.map((t) => /* @__PURE__ */ (0, Q.jsx)(e, {
								variant: "secondary",
								size: "small",
								title: t.example || t.label,
								className: "max-w-full [&>span]:min-w-0 [&>span]:shrink",
								onClick: () => {
									H({
										file: t.file,
										dir: t.dir
									}), F.current = !1;
								},
								children: /* @__PURE__ */ (0, Q.jsx)("span", {
									className: "truncate",
									children: t.label
								})
							}, t.label))
						})]
					}) : null,
					/* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": "我的方案",
						children: [
							/* @__PURE__ */ (0, Q.jsx)("p", {
								className: "text-caption-1-medium text-text-secondary",
								children: "我的方案"
							}),
							ve.length ? /* @__PURE__ */ (0, Q.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: ve.map((t) => /* @__PURE__ */ (0, Q.jsxs)("span", {
									className: "inline-flex items-center gap-1",
									children: [/* @__PURE__ */ (0, Q.jsx)(e, {
										variant: "secondary",
										size: "small",
										title: `${t.file}${t.dir ? ` / ${t.dir}` : ""}`,
										className: "max-w-full [&>span]:min-w-0 [&>span]:shrink",
										onClick: () => Te(t),
										children: /* @__PURE__ */ (0, Q.jsx)("span", {
											className: "truncate",
											children: t.name
										})
									}), /* @__PURE__ */ (0, Q.jsx)(e, {
										variant: "ghost",
										size: "small",
										"aria-label": `删除方案「${t.name}」`,
										...B(Ce),
										onClick: () => Oe(t.name),
										children: "删除"
									})]
								}, t.name))
							}) : null,
							/* @__PURE__ */ (0, Q.jsxs)("div", {
								className: "flex min-w-0 flex-wrap items-start gap-2",
								children: [/* @__PURE__ */ (0, Q.jsx)(c, {
									"aria-label": "方案名称",
									placeholder: "给当前模板起个名字",
									className: "min-w-0 basis-48 flex-1",
									name: "organize-scheme-name",
									autoComplete: "off",
									value: xe,
									onChange: (e) => Se(e)
								}), /* @__PURE__ */ (0, Q.jsx)(e, {
									variant: "secondary",
									size: "small",
									disabled: !xe.trim(),
									...B(Ce),
									onClick: De,
									children: "保存当前为方案"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, Q.jsxs)("p", {
						"aria-live": "polite",
						"aria-busy": j.isFetching,
						"data-organize-example": "",
						className: "text-caption-1-regular text-text-secondary",
						children: ["路径示例：", /* @__PURE__ */ (0, Q.jsx)("code", {
							className: "wrap-anywhere",
							children: j.data?.example || j.data?.error || (j.isError ? U(j.error) : "正在预览…")
						})]
					}),
					l?.placeholders?.length ? /* @__PURE__ */ (0, Q.jsxs)("div", {
						className: "flex flex-col gap-2",
						role: "group",
						"aria-label": "插入参数",
						children: [/* @__PURE__ */ (0, Q.jsxs)("p", {
							className: "text-caption-1-regular text-text-secondary",
							"aria-live": "polite",
							children: [
								/* @__PURE__ */ (0, Q.jsx)("strong", {
									className: "text-caption-1-semibold text-text-primary",
									children: "插入参数"
								}),
								"（到",
								P === "file" ? "文件名模板" : "目录模板",
								"）"
							]
						}), /* @__PURE__ */ (0, Q.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: l.placeholders.map((t) => /* @__PURE__ */ (0, Q.jsx)(e, {
								variant: "ghost",
								size: "small",
								"aria-label": `${t.label} {${t.key}}`,
								onClick: () => ue(t.key),
								children: /* @__PURE__ */ (0, Q.jsxs)("span", {
									className: "inline-flex flex-wrap items-center gap-x-1.5",
									children: [/* @__PURE__ */ (0, Q.jsx)("code", { children: `{${t.key}}` }), /* @__PURE__ */ (0, Q.jsx)("span", {
										className: "text-text-secondary",
										children: t.label
									})]
								})
							}, t.key))
						})]
					}) : null,
					/* @__PURE__ */ (0, Q.jsx)("p", {
						className: "text-caption-1-regular leading-4.5 text-text-secondary",
						children: "点击参数插入光标处，选中文字可替换。方括号里的内容在字段为空时整段省略。"
					})
				]
			}),
			/* @__PURE__ */ (0, Q.jsx)("div", {
				"aria-live": "polite",
				className: "mt-3 flex flex-col gap-2 empty:hidden",
				children: W
			})
		]
	});
}
// src/react/data-cleanup/orphan-records-card.tsx
var kt = q("play"), At = () => K.invalidateQueries({
	queryKey: S,
	exact: !0
});
function jt({ item: t, toast: n }) {
	let [r, i] = (0, Z.useState)(t.candidates[0]?.id ?? null), a = et({
		mutationFn: () => se(t.id, Number(r)),
		onSuccess: () => {
			let e = t.candidates.find((e) => e.id === r);
			n(`已将「${t.name}」的个人记录转移到「${e?.name ?? "所选文件"}」`), At();
		},
		onError: (e) => n(U(e))
	}), o = et({
		mutationFn: () => Re(t.id),
		onSuccess: (e) => {
			n(e.blocked.length ? `「${t.name}」的文件已恢复，记录未删除；下次扫描后恢复为在库状态` : `已删除「${t.name}」的作品记录及个人记录`), At();
		}
	}), s = () => {
		V({
			title: "删除记录",
			body: `将删除「${t.name}」的作品记录${ze(t.records) ? `及其个人记录（${ze(t.records)}）` : ""}。此操作不可撤销。`,
			confirmLabel: "删除记录",
			danger: !0,
			onConfirm: () => o.mutateAsync()
		});
	}, c = a.isPending || o.isPending;
	return /* @__PURE__ */ (0, Q.jsxs)("span", {
		className: "flex min-w-0 flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "danger",
				size: "small",
				...B(c),
				onClick: s,
				children: "删除记录"
			}),
			t.candidates.length ? /* @__PURE__ */ (0, Q.jsx)(M, {
				"aria-label": `选择接收 ${t.name} 个人记录的文件`,
				prefix: "接收",
				className: "w-52",
				selectedKey: r,
				onSelectionChange: (e) => {
					e !== null && i(Number(e));
				},
				children: t.candidates.map((e) => /* @__PURE__ */ (0, Q.jsx)(te, {
					id: e.id,
					textValue: ce(e),
					children: ce(e)
				}, e.id))
			}) : null,
			t.candidates.length ? /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "primary",
				size: "small",
				disabled: r === null,
				...B(c),
				onClick: () => a.mutate(),
				children: "转移记录"
			}) : null
		]
	});
}
function Mt({ item: e }) {
	return /* @__PURE__ */ (0, Q.jsxs)("span", {
		className: "flex min-w-0 items-center gap-3",
		children: [/* @__PURE__ */ (0, Q.jsxs)("span", {
			className: "relative inline-grid aspect-16/10 w-24 flex-none place-items-center max-cleanup-tight:hidden overflow-hidden rounded-lg border border-separator-border bg-background-tertiary-default text-text-tertiary",
			children: [/* @__PURE__ */ (0, Q.jsx)(kt, {
				"aria-hidden": !0,
				className: "size-5"
			}), e.has_thumb ? /* @__PURE__ */ (0, Q.jsx)("img", {
				src: `/thumb?id=${e.id}&c=4`,
				alt: "",
				loading: "lazy",
				onError: (e) => e.currentTarget.remove(),
				className: "absolute inset-0 size-full object-contain"
			}) : null]
		}), /* @__PURE__ */ (0, Q.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, Q.jsx)("span", {
				title: e.name,
				className: "truncate text-body-regular text-text-primary",
				children: e.name
			}), /* @__PURE__ */ (0, Q.jsx)("small", {
				className: "truncate text-caption-1-regular text-text-secondary",
				children: [e.code, m[e.location] || e.location].filter(Boolean).join(" · ")
			})]
		})]
	});
}
function Nt({ toast: t }) {
	let [n, r] = (0, Z.useState)([]), o = Y({
		queryKey: S,
		queryFn: ({ signal: e }) => xe(e)
	}), s = o.data?.items ?? [], c = et({
		mutationFn: (e) => Re(e),
		onSuccess: (e) => {
			t(`已删除 ${e.purged} 条作品记录及其个人记录${e.blocked.length ? `；${e.blocked.length} 条文件已恢复，记录未删除` : ""}`), r([]), At();
		}
	}), l = (e) => void V({
		title: "删除所选记录",
		body: `将删除以下 ${e.length} 条作品记录及其全部个人记录。此操作不可撤销。`,
		items: e.map((e) => e.name),
		confirmLabel: "删除所选记录",
		danger: !0,
		onConfirm: () => c.mutateAsync(e.map((e) => e.id))
	}), u = [
		{
			id: "item",
			label: "作品",
			width: 480,
			min: 320,
			value: (e) => e.name,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)(Mt, { item: e })
		},
		{
			id: "records",
			label: "个人记录",
			width: 176,
			min: 144,
			value: (e) => ze(e.records),
			render: (e) => /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "block min-w-0 whitespace-normal wrap-anywhere",
				children: ze(e.records) || "无"
			})
		},
		{
			id: "target",
			label: "操作",
			width: s.some((e) => e.candidates.length) ? 360 : 128,
			min: 128,
			value: (e) => e.candidates.length,
			render: (e) => /* @__PURE__ */ (0, Q.jsx)(jt, {
				item: e,
				toast: t
			})
		}
	];
	return !o.isError && !s.length ? null : /* @__PURE__ */ (0, Q.jsx)("section", {
		id: "orphan-records",
		"aria-labelledby": "orphan-records-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: o.isError ? /* @__PURE__ */ (0, Q.jsxs)(i, {
			layout: "stack",
			labelledBy: "orphan-records-title",
			children: [/* @__PURE__ */ (0, Q.jsx)(a, {
				id: "orphan-records-title",
				children: "文件已丢失的记录"
			}), /* @__PURE__ */ (0, Q.jsx)(b, {
				tone: "error",
				title: "读取文件已丢失的记录失败",
				children: U(o.error)
			})]
		}) : /* @__PURE__ */ (0, Q.jsx)(ot, {
			label: "文件已消失的作品",
			items: s,
			columns: u,
			title: "文件已丢失的记录",
			titleId: "orphan-records-title",
			unit: "条作品",
			description: "这些作品的源文件已删除，喜欢、稍后看、播放列表与观看历史仍保留。选择替代文件后，这些记录会转移到该文件，旧作品记录随之删除。",
			rowId: (e) => String(e.id),
			rowLabel: (e) => e.name,
			selected: n,
			onSelected: r,
			actions: (t) => /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "danger",
				size: "small",
				disabled: !t.length,
				...B(c.isPending),
				onClick: () => l(t),
				children: `删除所选记录（${t.length}）`
			})
		})
	});
}
// src/react/data-cleanup/resource-sync-card.tsx
var Pt = q("git-compare"), Ft = q("rotate-cw"), It = "暂时无法读取进度，正在重新连接…", Lt = "清理失效条目", Rt = "inline-grid w-full grid-flow-col auto-cols-fr gap-4 max-plain-stat-pair:grid-flow-row max-plain-stat-pair:grid-cols-2 max-plain-stat-single:grid-cols-1", $ = (e) => Number(e || 0).toLocaleString();
function zt({ scan: e, partial: t = !1 }) {
	let n = e.cache ?? {
		files: 0,
		bytes: 0
	};
	return /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)("div", {
		className: Rt,
		children: (e.sources ?? []).map((e) => /* @__PURE__ */ (0, Q.jsxs)("article", {
			className: at(),
			children: [/* @__PURE__ */ (0, Q.jsx)(X, {
				label: j[e.location] || "媒体来源",
				mark: /* @__PURE__ */ (0, Q.jsx)(N, { mark: y[e.location] ?? "database" }),
				aside: /* @__PURE__ */ (0, Q.jsx)(ut, {
					online: e.online,
					children: e.online ? "可访问" : "离线"
				}),
				figure: e.online ? `${$(e.missing)} 项` : "—",
				meta: e.online ? Ke(e) : `${Ke(e)} · 本次已跳过`,
				wrapMeta: !0
			}), e.online && e.unreadable > 0 ? /* @__PURE__ */ (0, Q.jsx)("span", {
				className: "self-start",
				children: /* @__PURE__ */ (0, Q.jsxs)(P, {
					tone: "warning",
					children: [$(e.unreadable), " 个目录未读取"]
				})
			}) : null]
		}, e.location))
	}), !t && /* @__PURE__ */ (0, Q.jsxs)("div", {
		className: Rt,
		children: [
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: at(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: "待永久删除",
					figure: `${$(Le(e))} 项`,
					meta: "文件已不在盘上，含回收站"
				})
			}),
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: at(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: "将标为已消失",
					figure: `${$(e.vanish)} 项`,
					meta: "带个人记录，记录留着"
				})
			}),
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: at(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: "空文件夹",
					figure: `${$(e.empty)} 个`,
					meta: "保留来源根目录"
				})
			}),
			/* @__PURE__ */ (0, Q.jsx)("article", {
				className: at(),
				children: /* @__PURE__ */ (0, Q.jsx)(X, {
					label: "可清理的缓存",
					figure: `${$(n.files)} 个`,
					meta: n.files ? W(n.bytes) : ""
				})
			})
		]
	})] });
}
function Bt({ toast: t }) {
	let n = J({
		queryKey: D,
		queryFn: ({ signal: e }) => we(e),
		start: Xe,
		onFinish: (e) => {
			if (K.invalidateQueries({
				queryKey: ne,
				exact: !0
			}), K.invalidateQueries({
				queryKey: O,
				exact: !0
			}), e.status !== "complete") return;
			let { done: n, left: r } = L(e);
			r ? t(`已完成 ${$(n)} 项，${$(r)} 项没有处理`, { warning: !0 }) : t("已清理失效条目");
		}
	}), r = J({
		queryKey: O,
		queryFn: ({ signal: e }) => Te(e),
		start: Ze,
		onStarted: () => n.dismiss()
	}), o = r.job, s = r.running || r.start.isPending, c = n.running || n.start.isPending, l = o?.status === "complete" || o?.status === "failed", u = s ? "扫描中" : l ? "重新扫描" : "检查文件", d = (e) => void V({
		title: Lt,
		body: I(e),
		confirmLabel: Lt,
		danger: !0,
		onConfirm: () => n.start.mutateAsync(e.scan_id || "")
	}), f = n.outcome, p = (e) => {
		let t = L(e).left > 0;
		return /* @__PURE__ */ (0, Q.jsx)(b, {
			tone: t ? "warning" : "success",
			title: t ? "部分完成" : "清理结果",
			children: oe(e, W)
		});
	}, m = null, h = null;
	if (f?.status === "failed") h = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "资源清理未完成",
		children: f.error || "请查看任务记录，核对已处理的文件。"
	});
	else if (f) h = p(f);
	else if (n.running) m = /* @__PURE__ */ (0, Q.jsx)(re, {
		embedded: !0,
		label: n.job?.message || "正在复核并清理失效条目"
	});
	else if (r.start.isError) h = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "扫描失败",
		children: U(r.start.error)
	});
	else if (r.query.isError && o) h = /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: "任务状态",
		children: It
	});
	else if (o?.status === "running") {
		let e = Ge(o);
		m = /* @__PURE__ */ (0, Q.jsx)(re, {
			embedded: !0,
			label: e,
			value: o.completed_sources,
			total: o.total_sources
		}), o.sources?.length && (h = /* @__PURE__ */ (0, Q.jsx)(zt, {
			scan: o,
			partial: !0
		}));
	} else if (o?.status === "failed") h = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [o.sources?.length ? /* @__PURE__ */ (0, Q.jsx)(zt, {
		scan: o,
		partial: !0
	}) : null, /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "扫描失败",
		children: o.error || "后台扫描失败"
	})] });
	else if (o?.status === "complete" && o.applied) h = n.job?.status === "complete" ? p(n.job) : /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "neutral",
		title: "清理结果",
		children: "这次检查的结果已经清理，重新扫描可再核对。"
	});
	else if (o?.status === "complete") {
		let t = ke(o);
		h = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [/* @__PURE__ */ (0, Q.jsx)(zt, { scan: o }), t ? /* @__PURE__ */ (0, Q.jsx)(b, {
			tone: "neutral",
			title: "清理内容",
			action: /* @__PURE__ */ (0, Q.jsx)(e, {
				variant: "danger",
				...B(c),
				onClick: () => d(o),
				children: c ? "正在复核并清理…" : Lt
			}),
			children: R(o)
		}) : /* @__PURE__ */ (0, Q.jsx)("p", {
			className: "mr-auto text-body-regular text-notification-success-foreground",
			children: "已检查可访问的来源，没有待清理的记录、空文件夹或缓存。"
		})] });
	}
	return n.start.isError && !f && (h = /* @__PURE__ */ (0, Q.jsxs)(Q.Fragment, { children: [h, /* @__PURE__ */ (0, Q.jsx)(b, {
		tone: "error",
		title: "清理失败",
		children: U(n.start.error)
	})] })), /* @__PURE__ */ (0, Q.jsxs)("section", {
		id: "resource-sync",
		"aria-labelledby": "resource-sync-title",
		className: "flex scroll-mt-20 flex-col gap-4",
		children: [/* @__PURE__ */ (0, Q.jsxs)(i, {
			layout: "split",
			labelledBy: "resource-sync-title",
			footer: /* @__PURE__ */ (0, Q.jsx)(e, {
				"data-resource-scan": !0,
				leadingIcon: l && !s ? Ft : Pt,
				...B(s),
				onClick: () => {
					s || r.start.mutate();
				},
				children: u
			}),
			children: [
				/* @__PURE__ */ (0, Q.jsx)(a, {
					id: "resource-sync-title",
					gap: "small",
					children: "资源同步"
				}),
				/* @__PURE__ */ (0, Q.jsx)("p", {
					className: "max-w-190 text-body-2-regular leading-5 text-text-secondary",
					children: "按馆藏记录逐条查找本地磁盘与网盘上的文件，列出文件已不存在的记录、空文件夹，以及不再被引用的缓存。"
				}),
				/* @__PURE__ */ (0, Q.jsx)("div", {
					"aria-live": "polite",
					className: "mt-4 empty:hidden",
					children: m
				})
			]
		}), /* @__PURE__ */ (0, Q.jsx)("div", {
			"aria-live": "polite",
			className: "flex flex-col gap-4 empty:hidden",
			children: h
		})]
	});
}
// src/react/data-cleanup/data-cleanup-page.tsx
function Vt(e, t) {
	return e.data === void 0 ? { figure: e.isError ? "读取失败" : "—" } : t(e.data);
}
function Ht({ section: e, label: t, icon: n, value: r, open: i }) {
	return /* @__PURE__ */ (0, Q.jsx)("button", {
		type: "button",
		className: at({ interactive: !0 }),
		"data-cleanup-go": e,
		onClick: () => i(e),
		children: /* @__PURE__ */ (0, Q.jsx)(X, {
			label: t,
			icon: n,
			figure: r.figure,
			meta: r.meta
		})
	});
}
var Ut = q("square-check-big"), Wt = q("sparkles"), Gt = q("file-stack"), Kt = q("file-archive"), qt = q("trash"), Jt = [
	A,
	w,
	r
], Yt = () => {
	for (let e of Jt) K.invalidateQueries({
		queryKey: e,
		exact: !0
	});
};
function Xt({ toast: e, failure: t, open: n }) {
	let i = Y({
		queryKey: A,
		queryFn: ({ signal: e }) => Ee(e)
	}), a = Y({
		queryKey: w,
		queryFn: ({ signal: e }) => Se(e)
	}), o = Y({
		queryKey: r,
		queryFn: ({ signal: e }) => fe(e)
	}), s = Y({
		queryKey: l,
		queryFn: ({ signal: e }) => pe(e)
	}), c = Y({
		queryKey: ne,
		queryFn: ({ signal: e }) => De(e)
	}), u = Y({
		queryKey: v,
		queryFn: ({ signal: e }) => ve(e)
	}), d = (t) => e(t);
	return /* @__PURE__ */ (0, Q.jsxs)(nt, { children: [
		/* @__PURE__ */ (0, Q.jsxs)("div", {
			className: it,
			children: [
				/* @__PURE__ */ (0, Q.jsx)(Ht, {
					section: "review",
					label: "人工复核",
					icon: Ut,
					open: n,
					value: Vt(i, Ue)
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ht, {
					section: "quality",
					label: "高清版",
					icon: Wt,
					open: n,
					value: Vt(a, (e) => ({ figure: `${Number(e.total || 0).toLocaleString()} 个待升级` }))
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ht, {
					section: "duplicates",
					label: "重复文件",
					icon: Gt,
					open: n,
					value: Vt(o, (e) => Number(e.total || 0) ? {
						figure: `${Number(e.total).toLocaleString()} 组 · ${Number(e.files || 0).toLocaleString()} 个文件`,
						meta: `可回收 ${W(e.reclaimable || 0)}`
					} : { figure: "没有重复内容" })
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ht, {
					section: "ads",
					label: "垃圾文件",
					icon: Kt,
					open: n,
					value: Vt(s, (e) => ({
						figure: `${Number(e.pending_total || 0).toLocaleString()} 个待判断`,
						meta: Ae(e)
					}))
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ht, {
					section: "trash",
					label: "回收站",
					icon: qt,
					open: n,
					value: Vt(c, (e) => ({
						figure: `${Number(e.total || 0).toLocaleString()} 项在回收站`,
						meta: e.total ? `占用 ${W(e.bytes || 0)}` : ""
					}))
				})
			]
		}),
		/* @__PURE__ */ (0, Q.jsxs)("div", {
			className: "flex flex-col gap-4 max-cleanup-tight:gap-3",
			children: [
				/* @__PURE__ */ (0, Q.jsx)("div", {
					id: "libraryProcessing",
					className: "scroll-mt-20",
					children: /* @__PURE__ */ (0, Q.jsx)(h, {
						toast: d,
						monitor: !0,
						onComplete: Yt
					})
				}),
				/* @__PURE__ */ (0, Q.jsx)("div", {
					id: "mediaRepair",
					children: /* @__PURE__ */ (0, Q.jsx)(pt, { toast: d })
				}),
				/* @__PURE__ */ (0, Q.jsx)(Ot, {
					toast: d,
					failure: t
				})
			]
		}),
		/* @__PURE__ */ (0, Q.jsx)(Ct, {}),
		/* @__PURE__ */ (0, Q.jsx)(Nt, { toast: d }),
		G(u.data) ? /* @__PURE__ */ (0, Q.jsx)(Bt, { toast: e }) : null
	] });
}
export { Xt as DataCleanupPage };

//# debugId=2aa3c6eb-4c86-4bb0-85b3-1e77730aae2f