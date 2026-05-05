// import { createFileRoute, Link } from '@tanstack/react-router'
// import { useState }              from 'react'
// import { toast }                 from 'react-hot-toast'
// import {
//   useExecutionDetail,
//   useExecutionTokens,
//   useDeliveryLogs,
//   useExecutionTransition,
//   type ExecutionTransitionAction,
// } from '@/hooks/useExecutions'
// import { StageTimeline }         from '@/components/executions/StageTimeline'
// import { Card, CardHeader }      from '@/components/ui/Card'
// import { Badge, executionStatusBadge } from '@/components/ui/Badge'
// import { Button }                from '@/components/ui/Button'
// import { Spinner }               from '@/components/ui/Spinner'
// import { formatDateTime, formatMs, formatBytes, formatNumber } from '@/lib/utils'
// import { cn }                    from '@/lib/utils'
// import {
//   ArrowLeft, RotateCcw, Download,
//   Copy, CheckCircle, XCircle, Clock, Zap, DollarSign,
//   FileText, ChevronDown, ChevronRight, Play, Square, AlertTriangle,
// } from 'lucide-react'

// export const Route = createFileRoute('/dashboard/executions/$id')({
//   component: ExecutionDetailPage,
// })

// // ── JSON tree (reused from ResultViewer) ──────────────────────────────────────

// function JsonNode({ data, depth = 0 }: { data: any; depth?: number }) {
//   const [open, setOpen] = useState(depth < 2)

//   if (data === null)              return <span style={{ color: 'var(--text-muted)' }}>null</span>
//   if (typeof data === 'boolean')  return <span style={{ color: 'var(--amber)' }}>{String(data)}</span>
//   if (typeof data === 'number')   return <span style={{ color: '#60a5fa' }}>{data}</span>
//   if (typeof data === 'string') {
//     const display = data.length > 100 ? data.slice(0, 100) + '…' : data
//     return <span style={{ color: '#4ade80' }}>"{display}"</span>
//   }

//   if (Array.isArray(data)) {
//     if (!data.length) return <span style={{ color: 'var(--text-muted)' }}>[]</span>
//     return (
//       <span>
//         <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-0.5 hover:opacity-80"
//           style={{ color: 'var(--text-muted)' }}>
//           {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
//           <span style={{ color: 'var(--text-primary)' }}>[</span>
//           {!open && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{data.length} items</span>}
//           {!open && <span style={{ color: 'var(--text-primary)' }}>]</span>}
//         </button>
//         {open && (
//           <div style={{ paddingLeft: 16 }}>
//             {data.map((item, i) => (
//               <div key={i}>
//                 <JsonNode data={item} depth={depth + 1} />
//                 {i < data.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
//               </div>
//             ))}
//             <span style={{ color: 'var(--text-primary)' }}>]</span>
//           </div>
//         )}
//       </span>
//     )
//   }

//   if (typeof data === 'object') {
//     const keys = Object.keys(data)
//     if (!keys.length) return <span style={{ color: 'var(--text-muted)' }}>{'{}'}</span>
//     return (
//       <span>
//         <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-0.5 hover:opacity-80"
//           style={{ color: 'var(--text-muted)' }}>
//           {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
//           <span style={{ color: 'var(--text-primary)' }}>{'{'}</span>
//           {!open && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{keys.length} keys</span>}
//           {!open && <span style={{ color: 'var(--text-primary)' }}>{'}'}</span>}
//         </button>
//         {open && (
//           <div style={{ paddingLeft: 16 }}>
//             {keys.map((key, i) => (
//               <div key={key}>
//                 <span style={{ color: '#e879f9' }}>"{key}"</span>
//                 <span style={{ color: 'var(--text-muted)' }}>: </span>
//                 <JsonNode data={data[key]} depth={depth + 1} />
//                 {i < keys.length - 1 && <span style={{ color: 'var(--text-muted)' }}>,</span>}
//               </div>
//             ))}
//             <span style={{ color: 'var(--text-primary)' }}>{'}'}</span>
//           </div>
//         )}
//       </span>
//     )
//   }
//   return null
// }

// // ── Main page ─────────────────────────────────────────────────────────────────

// function ExecutionDetailPage() {
//   const { id }                         = Route.useParams()
//   const { data, isLoading }            = useExecutionDetail(id)
//   const { data: tokenData }            = useExecutionTokens(id)
//   const { data: deliveryData }         = useDeliveryLogs(id)
//   const transitionMutation             = useExecutionTransition()
//   const [activeTab, setActiveTab]      = useState<'result'|'stages'|'tokens'|'delivery'|'raw'>('result')
//   const [pendingAction, setPendingAction] = useState<ExecutionTransitionAction | null>(null)

//   const execution = data?.data
//   const tokens    = tokenData?.data
//   const delivery  = deliveryData?.data
//   function formatError(err: any) {
//     if (!err) return ''

//     // If it's already a string
//     if (typeof err === 'string') {
//       return err.slice(0, 1000) // limit size
//     }

//     // If it's an Error object
//     if (err.message) {
//       return err.message
//     }

//     try {
//       return JSON.stringify(err, null, 2).slice(0, 1000)
//     } catch {
//       return 'Unable to display error'
//     }
//   }

//   const handleTransition = async (
//     action: ExecutionTransitionAction,
//     reason?: string
//   ) => {
//     try {
//       setPendingAction(action)
//       const result = await transitionMutation.mutateAsync({ id, action, reason })
//       const newExecutionId = result?.data?.newExecutionId

//       if (action === 'retry') {
//         toast.success(newExecutionId ? `Retry queued (${newExecutionId.slice(0, 8)})` : 'Retry queued')
//         return
//       }

//       const actionLabels: Record<ExecutionTransitionAction, string> = {
//         requeue: 'Moved to queued',
//         process: 'Processing started',
//         stop: 'Execution stopped',
//         fail: 'Execution marked failed',
//         retry: 'Retry queued',
//       }

//       toast.success(actionLabels[action])
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Action failed')
//     } finally {
//       setPendingAction(null)
//     }
//   }

//   const handleCopy = () => {
//     if (!execution?.extractedData) return
//     navigator.clipboard.writeText(JSON.stringify(execution.extractedData, null, 2))
//     toast.success('Copied')
//   }

//   const handleDownload = () => {
//     if (!execution?.extractedData) return
//     const blob = new Blob([JSON.stringify(execution.extractedData, null, 2)], { type: 'application/json' })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement('a')
//     a.href = url; a.download = `${id.slice(0,8)}_result.json`; a.click()
//     URL.revokeObjectURL(url)
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <Spinner size="lg" />
//       </div>
//     )
//   }

//   if (!execution) {
//     return (
//       <div className="p-6 text-center">
//         <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Execution not found</p>
//         <Link to="/dashboard/executions"><Button variant="secondary" className="mt-4">← Back</Button></Link>
//       </div>
//     )
//   }

//   const isRunning = ['queued','processing'].includes(execution.status)
//   const canRetry  = ['failed','stopped'].includes(execution.status)
//   const canRequeue = ['failed', 'stopped'].includes(execution.status)
//   const canProcess = ['queued', 'failed', 'stopped'].includes(execution.status)
//   const canStop = ['queued', 'processing'].includes(execution.status)
//   const canFail = !['success', 'failed'].includes(execution.status)

//   const TABS = [
//     { id: 'result',   label: 'Result'   },
//     { id: 'stages',   label: 'Stages'   },
//     { id: 'tokens',   label: 'Tokens'   },
//     { id: 'delivery', label: 'Delivery' },
//     { id: 'raw',      label: 'Raw JSON' },
//   ] as const

//   return (
//     <div className="p-6 max-w-275 mx-auto">

//       {/* Back */}
//       <Link to="/dashboard/executions"
//         className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors hover:text-amber-400"
//         style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//         <ArrowLeft size={12} />
//         All Executions
//       </Link>

//       {/* Header card */}
//       <div
//         className="p-5 mb-5"
//         style={{
//           background:   'var(--bg-surface)',
//           border:       '1px solid var(--border)',
//           borderRadius: 'var(--radius-lg)',
//         }}
//       >
//         <div className="flex items-start justify-between gap-4 mb-5">
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <Badge variant={executionStatusBadge(execution.status)} dot={isRunning}>
//                 {execution.status}
//               </Badge>
//               <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                 {execution.sourceType}
//               </span>
//             </div>
//             <h1
//               className="text-2xl font-bold mb-1"
//               style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
//             >
//               {execution.originalFilename || 'Unnamed Document'}
//             </h1>
//             <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//               {id}
//             </div>
//           </div>
//           <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
//             {execution.status === 'success' && execution.extractedData && (
//               <>
//                 <Button variant="ghost" size="sm" onClick={handleCopy}>
//                   <Copy size={12} /> Copy
//                 </Button>
//                 <Button variant="ghost" size="sm" onClick={handleDownload}>
//                   <Download size={12} /> Download
//                 </Button>
//               </>
//             )}
//             {canRequeue && (
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={() => handleTransition('requeue', 'Moved to queued from dashboard')}
//                 loading={pendingAction === 'requeue'}
//                 disabled={transitionMutation.isPending}
//               >
//                 <RotateCcw size={12} /> Requeue
//               </Button>
//             )}
//             {canProcess && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleTransition('process', 'Started manually from dashboard')}
//                 loading={pendingAction === 'process'}
//                 disabled={transitionMutation.isPending}
//               >
//                 <Play size={12} /> Process
//               </Button>
//             )}
//             {canStop && (
//               <Button
//                 variant="danger"
//                 size="sm"
//                 onClick={() => handleTransition('stop', 'Stopped manually from dashboard')}
//                 loading={pendingAction === 'stop'}
//                 disabled={transitionMutation.isPending}
//               >
//                 <Square size={12} /> Stop
//               </Button>
//             )}
//             {canFail && (
//               <Button
//                 variant="danger"
//                 size="sm"
//                 onClick={() => handleTransition('fail', 'Marked failed manually from dashboard')}
//                 loading={pendingAction === 'fail'}
//                 disabled={transitionMutation.isPending}
//               >
//                 <AlertTriangle size={12} /> Mark Failed
//               </Button>
//             )}
//             {canRetry && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleTransition('retry', 'Manual re-run from dashboard')}
//                 loading={pendingAction === 'retry'}
//                 disabled={transitionMutation.isPending}
//               >
//                 <RotateCcw size={12} /> Re-run
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Metadata grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
//           style={{ borderTop: '1px solid var(--border)' }}>
//           {[
//             {
//               label: 'Processing Time',
//               value: formatMs(execution.processingTimeMs),
//               icon: <Clock size={12} />,
//               color: 'var(--text-primary)',
//             },
//             {
//               label: 'File Size',
//               value: execution.fileSizeBytes ? formatBytes(execution.fileSizeBytes) : '—',
//               icon: <FileText size={12} />,
//               color: 'var(--text-primary)',
//             },
//             {
//               label: 'Created',
//               value: formatDateTime(execution.createdAt),
//               icon: <Clock size={12} />,
//               color: 'var(--text-secondary)',
//             },
//             {
//               label: 'Completed',
//               value: formatDateTime(execution.completedAt),
//               icon: <CheckCircle size={12} />,
//               color: execution.status === 'success' ? 'var(--green)' : 'var(--text-muted)',
//             },
//           ].map(({ label, value, icon, color }) => (
//             <div key={label}>
//               <div className="flex items-center gap-1.5 mb-1"
//                 style={{ color: 'var(--text-muted)' }}>
//                 {icon}
//                 <span className="text-xs uppercase tracking-widest"
//                   style={{ fontFamily: 'var(--font-display)', fontSize: '10px' }}>
//                   {label}
//                 </span>
//               </div>
//               <div className="text-sm font-medium"
//                 style={{ color, fontFamily: 'var(--font-mono)' }}>
//                 {value}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Error message */}
//       {execution.errorMessage && (
//   <pre
//     className="mt-4 p-3 text-xs"
//     style={{
//       background:   'rgba(239,68,68,0.05)',
//       border:       '1px solid rgba(239,68,68,0.2)',
//       borderRadius: 'var(--radius-md)',
//       color:        'var(--red)',
//       fontFamily:   'var(--font-mono)',
//       maxHeight:    '200px',
//       overflow:     'auto',
//       whiteSpace:   'pre-wrap',
//       wordBreak:    'break-word',
//     }}
//   >
//     ⚠ {formatError(execution.errorMessage)}
//   </pre>
// )}
//         {/* Running indicator */}
//         {isRunning && (
//           <div
//             className="mt-4 flex items-center gap-2 p-3 text-xs"
//             style={{
//               background:   'var(--amber-glow)',
//               border:       '1px solid var(--amber-dim)',
//               borderRadius: 'var(--radius-md)',
//               color:        'var(--amber)',
//               fontFamily:   'var(--font-mono)',
//             }}
//           >
//             <Spinner size="xs" />
//             Processing — auto-refreshing every 2 seconds
//           </div>
//         )}
//       </div>

//       {/* Tab bar */}
//       <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
//         {TABS.map(t => (
//           <button
//             key={t.id}
//             onClick={() => setActiveTab(t.id)}
//             className={cn(
//               'px-5 py-2.5 text-xs font-semibold uppercase tracking-widest',
//               'border-b-2 transition-colors -mb-px',
//               activeTab === t.id
//                 ? 'border-amber-500 text-amber-400'
//                 : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
//             )}
//             style={{ fontFamily: 'var(--font-display)' }}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {/* ── RESULT TAB ──────────────────────────────────────────────────── */}
//       {activeTab === 'result' && (
//         <div className="space-y-4 animate-fade-in-up">
//           {/* Key fields */}
//           {execution.extractedData && (
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//               {[
//                 ['Doc Type',    execution.extractedData?.document_type],
//                 ['Grand Total', execution.extractedData?.grand_total != null
//                   ? `${execution.extractedData.currency || ''} ${execution.extractedData.grand_total}`
//                   : null],
//                 ['Vendor',      execution.extractedData?.vendor?.name],
//                 ['Confidence',  execution.extractedData?.confidence != null
//                   ? `${Math.round(execution.extractedData.confidence * 100)}%`
//                   : null],
//               ].map(([label, value]) => value != null ? (
//                 <div
//                   key={label as string}
//                   className="p-3"
//                   style={{
//                     background:   'var(--bg-surface)',
//                     border:       '1px solid var(--border)',
//                     borderRadius: 'var(--radius-md)',
//                   }}
//                 >
//                   <div className="text-xs uppercase tracking-wider mb-1"
//                     style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
//                     {label}
//                   </div>
//                   <div className="text-sm font-semibold truncate"
//                     style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
//                     {String(value)}
//                   </div>
//                 </div>
//               ) : null)}
//             </div>
//           )}

//           {/* JSON tree */}
//           <Card padding="none">
//             <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
//               <span className="text-xs uppercase tracking-widest font-semibold"
//                 style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
//                 Extracted Data
//               </span>
//             </div>
//             {execution.extractedData ? (
//               <div
//                 className="overflow-auto text-xs leading-relaxed p-5"
//                 style={{
//                   background:   'var(--bg-base)',
//                   fontFamily:   'var(--font-mono)',
//                   maxHeight:    520,
//                 }}
//               >
//                 <JsonNode data={execution.extractedData} />
//               </div>
//             ) : (
//               <div className="py-16 text-center">
//                 <span className="text-xs tracking-widest"
//                   style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                   {isRunning ? 'EXTRACTION IN PROGRESS…' : 'NO DATA EXTRACTED'}
//                 </span>
//               </div>
//             )}
//           </Card>
//         </div>
//       )}

//       {/* ── STAGES TAB ──────────────────────────────────────────────────── */}
//       {activeTab === 'stages' && (
//         <Card padding="md" className="animate-fade-in-up">
//           <CardHeader title="Processing Stages" subtitle="7-stage extraction pipeline" />
//           <StageTimeline stages={execution.stages} />
//         </Card>
//       )}

//       {/* ── TOKENS TAB ──────────────────────────────────────────────────── */}
//       {activeTab === 'tokens' && (
//         <div className="space-y-4 animate-fade-in-up">
//           {tokens ? (
//             <>
//               {/* Totals */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 {[
//                   { label: 'Prompt Tokens',     value: formatNumber(tokens.total?.promptTokens || 0),     icon: <Zap size={12} /> },
//                   { label: 'Completion Tokens', value: formatNumber(tokens.total?.completionTokens || 0), icon: <Zap size={12} /> },
//                   { label: 'Total Tokens',      value: formatNumber(tokens.total?.totalTokens || 0),      icon: <Zap size={12} />, accent: true },
//                   { label: 'Total Cost',        value: `$${(tokens.total?.costUsd || 0).toFixed(6)}`,     icon: <DollarSign size={12} />, accent: true },
//                 ].map(({ label, value, icon, accent }) => (
//                   <div
//                     key={label}
//                     className="p-3"
//                     style={{
//                       background:   accent ? 'var(--amber-glow)' : 'var(--bg-surface)',
//                       border:       `1px solid ${accent ? 'var(--amber-dim)' : 'var(--border)'}`,
//                       borderRadius: 'var(--radius-md)',
//                     }}
//                   >
//                     <div className="flex items-center gap-1.5 mb-1"
//                       style={{ color: accent ? 'var(--amber)' : 'var(--text-muted)' }}>
//                       {icon}
//                       <span className="text-xs uppercase tracking-widest"
//                         style={{ fontFamily: 'var(--font-display)', fontSize: '10px' }}>
//                         {label}
//                       </span>
//                     </div>
//                     <div className="text-lg font-bold"
//                       style={{ color: accent ? 'var(--amber)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
//                       {value}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Calls table */}
//               <Card padding="md">
//                 <CardHeader title="AI Calls" />
//                 {(tokens.calls || []).map((call: any, i: number) => (
//                   <div
//                     key={i}
//                     className="flex items-center gap-4 py-3"
//                     style={{ borderBottom: i < tokens.calls.length - 1 ? '1px solid var(--border)' : 'none' }}
//                   >
//                     <div
//                       className="px-2 py-0.5 text-xs font-bold uppercase"
//                       style={{
//                         background:   call.provider === 'groq' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
//                         color:        call.provider === 'groq' ? 'var(--amber)' : 'var(--blue)',
//                         border:       `1px solid ${call.provider === 'groq' ? 'var(--amber-dim)' : 'rgba(59,130,246,0.2)'}`,
//                         borderRadius: 'var(--radius-sm)',
//                         fontFamily:   'var(--font-mono)',
//                       }}
//                     >
//                       {call.provider}
//                     </div>
//                     <div className="flex-1">
//                       <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
//                         {call.model}
//                       </div>
//                       <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                         {call.call_type} · {formatMs(call.latency_ms)}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
//                         {formatNumber(call.total_tokens)} tok
//                       </div>
//                       <div className="text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
//                         ${parseFloat(call.cost_usd).toFixed(6)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </Card>
//             </>
//           ) : (
//             <div className="py-16 text-center">
//               <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                 NO TOKEN DATA
//               </span>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── DELIVERY TAB ────────────────────────────────────────────────── */}
//       {activeTab === 'delivery' && (
//         <Card padding="md" className="animate-fade-in-up">
//           <CardHeader title="Delivery Logs" subtitle="Output delivery attempts" />
//           {delivery?.logs?.length > 0 ? (
//             <div className="space-y-2">
//               {delivery.logs.map((log: any) => (
//                 <div
//                   key={log.id}
//                   className="flex items-center gap-4 p-3"
//                   style={{
//                     background:   'var(--bg-elevated)',
//                     borderRadius: 'var(--radius-md)',
//                   }}
//                 >
//                   {log.status === 'success'
//                     ? <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
//                     : <XCircle    size={14} style={{ color: 'var(--red)',   flexShrink: 0 }} />
//                   }
//                   <div className="flex-1 min-w-0">
//                     <div className="text-xs font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
//                       {log.destination_label}
//                     </div>
//                     <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                       {log.destination_type} · attempt {log.attempt_number}
//                       {log.error_message && ` · ${log.error_message}`}
//                     </div>
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     {log.latency_ms && (
//                       <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                         {formatMs(log.latency_ms)}
//                       </div>
//                     )}
//                     {log.status_code && (
//                       <div className="text-xs" style={{
//                         color: log.status_code < 300 ? 'var(--green)' : 'var(--red)',
//                         fontFamily: 'var(--font-mono)',
//                       }}>
//                         HTTP {log.status_code}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="py-12 text-center">
//               <span className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
//                 NO DELIVERY LOGS YET
//               </span>
//             </div>
//           )}
//         </Card>
//       )}

//       {/* ── RAW JSON TAB ────────────────────────────────────────────────── */}
//       {activeTab === 'raw' && (
//         <Card padding="none" className="animate-fade-in-up">
//           <pre
//             className="text-xs overflow-auto p-5"
//             style={{
//               background:   'var(--bg-base)',
//               color:        'var(--text-secondary)',
//               fontFamily:   'var(--font-mono)',
//               maxHeight:    600,
//               borderRadius: 'var(--radius-lg)',
//             }}
//           >
//             {JSON.stringify(execution.extractedData, null, 2) || 'null'}
//           </pre>
//         </Card>
//       )}
//     </div>
//   )
// }


import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState }                  from 'react'
import { toast }                     from 'react-hot-toast'
import {
  useExecutionDetail,
  // useExecutionTokens,
  useDeliveryLogs,
  useRerunExecution,
  useExecutionTransition,
  useDeleteExecution,
} from '@/hooks/useExecutions'
import { StageTimeline }             from '@/components/executions/StageTimeline'
import { DataTableView }             from '@/components/executions/DataTableView'
import { DocPreview }                from '@/components/executions/DocPreview'
import { ExportMenu }                from '@/components/executions/ExportMenu'
import { Card, CardHeader }          from '@/components/ui/Card'
import { Badge, executionStatusBadge } from '@/components/ui/Badge'
import { Button }                    from '@/components/ui/Button'
import { Spinner }                   from '@/components/ui/Spinner'
import { formatDateTime, formatMs, formatBytes } from '@/lib/utils'
import {  CURRENCY_SYM } from '@/lib/currency'
import { cn }                        from '@/lib/utils'
import {
  ArrowLeft, RotateCcw, Copy,
  ChevronDown, ChevronRight,
  CheckCircle, XCircle, Clock, FileText,
  Table2, Code2, Eye, Columns, Square, Play, Trash2, Upload,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/executions/$id')({
  component: ExecutionDetailPage,
})

// ── Raw JSON viewer ───────────────────────────────────────────────────────────

function JsonNode({ data, depth = 0 }: { data: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)

  if (data === null)              return <span style={{ color: 'var(--text-muted)' }}>null</span>
  if (typeof data === 'boolean')  return <span style={{ color: 'var(--amber)' }}>{String(data)}</span>
  if (typeof data === 'number')   return <span style={{ color: '#60a5fa' }}>{data}</span>
  if (typeof data === 'string') {
    const d = data.length > 120 ? data.slice(0,120)+'…' : data
    return <span style={{ color: '#4ade80' }}>"{d}"</span>
  }
  if (Array.isArray(data)) {
    if (!data.length) return <span style={{ color: 'var(--text-muted)' }}>[]</span>
    return (
      <span>
        <button onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-0.5 hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}>
          {open ? <ChevronDown size={10}/> : <ChevronRight size={10}/>}
          <span style={{ color: 'var(--text-primary)' }}>[</span>
          {!open && <span style={{ color: 'var(--text-muted)', fontSize:10 }}>{data.length} items</span>}
          {!open && <span style={{ color: 'var(--text-primary)' }}>]</span>}
        </button>
        {open && (
          <div style={{ paddingLeft:16 }}>
            {data.map((item,i) => (
              <div key={i}>
                <JsonNode data={item} depth={depth+1}/>
                {i<data.length-1 && <span style={{ color:'var(--text-muted)' }}>,</span>}
              </div>
            ))}
            <span style={{ color:'var(--text-primary)' }}>]</span>
          </div>
        )}
      </span>
    )
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (!keys.length) return <span style={{ color:'var(--text-muted)' }}>{'{}'}</span>
    return (
      <span>
        <button onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-0.5 hover:opacity-80"
          style={{ color:'var(--text-muted)' }}>
          {open ? <ChevronDown size={10}/> : <ChevronRight size={10}/>}
          <span style={{ color:'var(--text-primary)' }}>{'{'}</span>
          {!open && <span style={{ color:'var(--text-muted)', fontSize:10 }}>{keys.length} keys</span>}
          {!open && <span style={{ color:'var(--text-primary)' }}>{'}'}</span>}
        </button>
        {open && (
          <div style={{ paddingLeft:16 }}>
            {keys.map((key,i) => (
              <div key={key}>
                <span style={{ color:'#e879f9' }}>"{key}"</span>
                <span style={{ color:'var(--text-muted)' }}>: </span>
                <JsonNode data={data[key]} depth={depth+1}/>
                {i<keys.length-1 && <span style={{ color:'var(--text-muted)' }}>,</span>}
              </div>
            ))}
            <span style={{ color:'var(--text-primary)' }}>{'}'}</span>
          </div>
        )}
      </span>
    )
  }
  return null
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ExecutionDetailPage() {
  const navigate = useNavigate()
  const { id }                    = Route.useParams()
  const { data, isLoading }       = useExecutionDetail(id)
  // const { data: tokenData }       = useExecutionTokens(id)
  const { data: deliveryData }    = useDeliveryLogs(id)
  const rerunMutation             = useRerunExecution()
  const transitionMutation        = useExecutionTransition()
  const deleteMutation            = useDeleteExecution()
  const [tab, setTab]             = useState<'result' | 'preview' | 'stages' | 'delivery' | 'raw'>('result')
  const [resultView, setResultView] = useState<'table' | 'json'>('table')
  const [splitView, setSplitView] = useState(false)

  const execution = data?.data
  // const tokens    = tokenData?.data
  const delivery  = deliveryData?.data

  const handleRerun = async () => {
    try {
      await rerunMutation.mutateAsync({ id, reason: 'Manual re-run from UI' })
      toast.success('Retry started on the same execution')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Re-run failed')
    }
  }

  const handleTransition = async (action: 'process' | 'stop', reason: string) => {
    try {
      await transitionMutation.mutateAsync({ id, action, reason })
      toast.success(action === 'stop' ? 'Execution stopped' : 'Processing started')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed')
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm('Delete this execution? This hides it from your list.')
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Execution deleted')
      navigate({ to: '/dashboard/executions' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    }
  }

  const copyJson = () => {
    if (!execution?.extractedData) return
    navigator.clipboard.writeText(JSON.stringify(execution.extractedData, null, 2))
    toast.success('Copied to clipboard')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!execution) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Execution not found
        </p>
        <Link to="/dashboard/executions">
          <Button variant="secondary" className="mt-4">← Back</Button>
        </Link>
      </div>
    )
  }

  const isRunning = ['queued','processing'].includes(execution.status)
  const canRerun  = ['failed','stopped'].includes(execution.status)
  const canStop = ['queued', 'processing'].includes(execution.status)
  const canProcess = ['queued', 'failed', 'stopped'].includes(execution.status)
  const hasData   = !!execution.extractedData
  const createdAtMs = new Date(execution.createdAt).getTime()
  const isLongRunning = isRunning && Number.isFinite(createdAtMs) && (Date.now() - createdAtMs > 180000)

  const TABS = [
    { id: 'result',   label: 'Result',   icon: Table2   },
    { id: 'preview',  label: 'Document', icon: Eye      },
    { id: 'stages',   label: 'Pipeline', icon: Clock    },
    { id: 'delivery', label: 'Delivery', icon: CheckCircle },
    { id: 'raw',      label: 'Raw JSON', icon: Code2    },
  ] as const

  return (
    <div className="p-6 max-w-300 mx-auto">

      {/* Back */}
      <Link to="/dashboard/executions"
        className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors hover:text-amber-400"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <ArrowLeft size={12} /> All Executions
      </Link>

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <div className="p-5 mb-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={executionStatusBadge(execution.status)} dot={isRunning}>
                {execution.status}
              </Badge>
              <span className="text-xs uppercase"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {execution.sourceType}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {execution.originalFilename || 'Unnamed Document'}
            </h1>
            <div className="text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {id}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {hasData && (
              <>
                <Button variant="ghost" size="sm" onClick={copyJson}>
                  <Copy size={12} /> Copy JSON
                </Button>
                <ExportMenu executionId={id} filename={execution.originalFilename} />
              </>
            )}
            {canRerun && (
              <Button variant="outline" size="sm"
                onClick={handleRerun} loading={rerunMutation.isPending}>
                <RotateCcw size={12} /> Re-run
              </Button>
            )}
            {canProcess && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleTransition('process', 'Manual process from execution details')}
                loading={transitionMutation.isPending}
                disabled={deleteMutation.isPending}
              >
                <Play size={12} /> Process
              </Button>
            )}
            {canStop && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleTransition('stop', 'Manual stop from execution details')}
                loading={transitionMutation.isPending}
                disabled={deleteMutation.isPending}
              >
                <Square size={12} /> Stop
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/dashboard/upload' })}
            >
              <Upload size={12} /> Upload Again
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
              disabled={transitionMutation.isPending}
            >
              <Trash2 size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Processing Time', value: formatMs(execution.processingTimeMs), icon: <Clock size={12}/> },
            { label: 'File Size',       value: execution.fileSizeBytes ? formatBytes(execution.fileSizeBytes) : '—', icon: <FileText size={12}/> },
            { label: 'Created',         value: formatDateTime(execution.createdAt),  icon: <Clock size={12}/> },
            { label: 'Completed',       value: formatDateTime(execution.completedAt), icon: <CheckCircle size={12}/> },
          ].map(({ label, value, icon }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 mb-1"
                style={{ color: 'var(--text-muted)' }}>
                {icon}
                <span className="text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '10px' }}>
                  {label}
                </span>
              </div>
              <div className="text-sm font-medium"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {execution.errorMessage && (
          <div className="mt-4 p-3 text-xs"
            style={{
              background:   'rgba(239,68,68,0.05)',
              border:       '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              color:        'var(--red)',
              fontFamily:   'var(--font-mono)',
            }}>
            {execution.errorMessage}
          </div>
        )}

        {/* Running indicator */}
        {isRunning && (
          <div className="mt-4 flex items-center gap-2 p-3 text-xs"
            style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
            <Spinner size="xs" />
            Processing — auto-refreshing every 2 seconds
          </div>
        )}
        {isLongRunning && (
          <div className="mt-3 flex items-center justify-between gap-3 p-3 text-xs"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
            <span>This execution is taking longer than expected. You can stop and process again.</span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleTransition('stop', 'Auto fallback: stopped long-running execution')}
                loading={transitionMutation.isPending}
              >
                <Square size={12} /> Stop
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRerun}
                loading={rerunMutation.isPending}
              >
                <RotateCcw size={12} /> Re-run
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex gap-0">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest',
                  'border-b-2 transition-colors -mb-px',
                  tab === t.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)'
                )}
                style={{ fontFamily: 'var(--font-display)' }}>
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Split view toggle (result tab) */}
        {tab === 'result' && hasData && (
          <Button
            variant={splitView ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setSplitView(!splitView)}
          >
            <Columns size={12} />
            {splitView ? 'Single' : 'Split'} View
          </Button>
        )}
      </div>

      {/* ── RESULT TAB ───────────────────────────────────────────────────── */}
      {tab === 'result' && (
        <div className={cn('gap-5 animate-fade-in-up', splitView ? 'grid grid-cols-2' : 'space-y-5')}>

          {/* Key fields row */}
          {hasData && execution.extractedData && (
            <div className={cn('grid gap-3', splitView ? 'col-span-2 grid-cols-4' : 'grid-cols-2 sm:grid-cols-4')}>
              {[
                ['Doc Type',    execution.extractedData?.document_type],
                ['Grand Total', execution.extractedData?.grand_total != null
                  ? `${CURRENCY_SYM}${execution.extractedData.grand_total}`
                  : null],
                ['Vendor',      execution.extractedData?.vendor?.name],
                ['Pages',       execution.extractedData?.page_count],
              ].map(([label, value]) => value != null ? (
                <div key={label as string} className="p-3"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    {label}
                  </div>
                  <div className="text-sm font-semibold truncate"
                    style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                    {String(value)}
                  </div>
                </div>
              ) : null)}
            </div>
          )}

          {/* Doc preview (left in split) */}
          {splitView && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                Document
              </div>
              <DocPreview
                executionId={id}
                filename={execution.originalFilename}
                mimeType={execution.mimeType}
              />
            </div>
          )}

          {/* Data (right in split, full width otherwise) */}
          <div>
            {/* Result view toggle */}
            {hasData && (
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  Extracted Data
                </div>
                <div className="flex"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  {(['table', 'json'] as const).map(v => (
                    <button key={v}
                      onClick={() => setResultView(v)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase transition-all',
                        resultView === v ? 'bg-amber-500 text-black' : 'text-(--text-muted) hover:text-(--text-secondary)'
                      )}
                      style={{ borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)' }}>
                      {v === 'table' ? <Table2 size={11}/> : <Code2 size={11}/>}
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasData && execution.extractedData ? (
              resultView === 'table' ? (
                <DataTableView data={execution.extractedData} />
              ) : (
                <div className="overflow-auto text-xs leading-relaxed p-5"
                  style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', maxHeight: 520 }}>
                  <JsonNode data={execution.extractedData} />
                </div>
              )
            ) : (
              <div className="py-16 text-center"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {isRunning ? 'EXTRACTION IN PROGRESS…' : 'NO DATA EXTRACTED'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DOCUMENT PREVIEW TAB ─────────────────────────────────────────── */}
      {tab === 'preview' && (
        <div className="animate-fade-in-up">
          <DocPreview
            executionId={id}
            filename={execution.originalFilename}
            mimeType={execution.mimeType}
            compact={false}
          />
        </div>
      )}

      {/* ── PIPELINE STAGES TAB ──────────────────────────────────────────── */}
      {tab === 'stages' && (
        <Card padding="md" className="animate-fade-in-up">
          <CardHeader title="Processing Pipeline"
            subtitle="7-stage extraction pipeline with timestamps" />
          <StageTimeline stages={execution.stages} />
        </Card>
      )}

      {/* ── DELIVERY TAB ─────────────────────────────────────────────────── */}
      {tab === 'delivery' && (
        <Card padding="md" className="animate-fade-in-up">
          <CardHeader title="Delivery Logs" subtitle="Output delivery history" />
          {delivery?.logs?.length > 0 ? (
            <div className="space-y-2">
              {delivery.logs.map((log: any) => (
                <div key={log.id}
                  className="flex items-center gap-4 p-3"
                  style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  {log.status === 'success'
                    ? <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }}/>
                    : <XCircle    size={14} style={{ color: 'var(--red)',   flexShrink: 0 }}/>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {log.destination_label}
                    </div>
                    <div className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {log.destination_type} · attempt {log.attempt_number}
                      {log.error_message && ` · ${log.error_message}`}
                    </div>
                  </div>
                  <div className="text-right text-xs"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {log.latency_ms && <div>{formatMs(log.latency_ms)}</div>}
                    {log.status_code && (
                      <div style={{ color: log.status_code < 300 ? 'var(--green)' : 'var(--red)' }}>
                        HTTP {log.status_code}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <span className="text-xs tracking-widest"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                NO DELIVERY LOGS
              </span>
            </div>
          )}
        </Card>
      )}

      {/* ── RAW JSON TAB ─────────────────────────────────────────────────── */}
      {tab === 'raw' && (
        <Card padding="none" className="animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs uppercase tracking-widest font-bold"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              Raw Extracted JSON
            </span>
            <Button variant="ghost" size="sm" onClick={copyJson}>
              <Copy size={12} /> Copy
            </Button>
          </div>
          <pre className="text-xs overflow-auto p-5"
            style={{
              background:   'var(--bg-base)',
              color:        'var(--text-secondary)',
              fontFamily:   'var(--font-mono)',
              maxHeight:    600,
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
            }}>
            {JSON.stringify(execution.extractedData, null, 2) || 'null'}
          </pre>
        </Card>
      )}
    </div>
  )
}
