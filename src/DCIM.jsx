import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Thermometer, Wind, Zap, Droplets, DoorOpen, AlertTriangle,
    Activity, Server, Fan, Battery, Plug, Flame, Settings,
    Clock, CheckCircle2, ArrowRight, Home, Menu, Download, Maximize, Minimize, ArrowUp, ArrowDown, Info, Check, Cloud, Sun, Wifi, WifiOff,
    Search, Link, X, Eye, Edit3, Save, Cable, Layers
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useRealtimeData } from './hooks/useRealtimeData';

// --- Phase 3: Constants ---
const portColorMap = {
    ETH: 'bg-cyan-500', PWR: 'bg-orange-500', FC: 'bg-purple-500',
    SFP: 'bg-green-500', MGMT: 'bg-yellow-500', USB: 'bg-slate-400',
};
const iconMap = { Server, Activity, Battery, Plug, Fan, Zap, Layers };

// --- COMPONENT LIBRARY ---

const Card = ({ title, children, className = "", alert = false }) => (
    <div className={`rounded-xl border backdrop-blur-md transition-all duration-300 ${alert
        ? 'bg-red-900/80 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
        : 'bg-slate-800/80 border-slate-700/50 shadow-lg'
        } ${className} flex flex-col overflow-hidden`}>
        {title && (
            <h3 className={`text-[10px] lg:text-sm font-medium uppercase tracking-wider px-2 lg:px-4 py-2 lg:py-3 border-b border-white/5 bg-gradient-to-r from-white/10 to-transparent flex items-center gap-2 ${alert ? 'text-red-200' : 'text-slate-400'
                }`}>
                {title}
            </h3>
        )}
        <div className="flex-1 relative p-4">
            {children}
        </div>
    </div>
);

const ValueDisplay = ({ label, value, unit, icon: Icon, color = "text-cyan-400" }) => {
    const prevValueRef = useRef(value);
    const [trend, setTrend] = useState('neutral');

    useEffect(() => {
        if (value > prevValueRef.current) {
            setTrend('up');
        } else if (value < prevValueRef.current) {
            setTrend('down');
        } else {
            setTrend('neutral');
        }
        prevValueRef.current = value;
    }, [value]);

    return (
        <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700/30 mb-2 last:mb-0 transition-colors group">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-slate-800 ${color} bg-opacity-20`}>
                    {Icon && <Icon size={20} className={color} />}
                </div>
                <div>
                    <p className="text-slate-400 text-xs uppercase font-semibold group-hover:text-white transition-colors">{label}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                    {trend === 'up' && <ArrowUp size={14} className="text-emerald-500 animate-pulse" />}
                    {trend === 'down' && <ArrowDown size={14} className="text-red-500 animate-pulse" />}
                    <span className={`text-xl font-bold font-mono drop-shadow-[0_0_5px_currentColor] ${color} group-hover:scale-110 transition-transform origin-right`}>{value}</span>
                    {unit && <span className="text-slate-500 text-sm ml-1">{unit}</span>}
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ active, labelOn = "ON", labelOff = "OFF", type = "normal" }) => {
    let colorClass = active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-700/30 text-slate-500 border-slate-600/30";
    if (type === "alarm") colorClass = active ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

    return (
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass} inline-flex items-center gap-1.5`}>
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${active ? (type === 'alarm' ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-500'}`}></div>
            {active ? labelOn : labelOff}
        </div>
    );
};

const CircularGauge = ({ value, label, color = "text-cyan-400", strokeColor = "stroke-cyan-500", size = "w-24 h-24", radius = 35, fontSize = "text-lg", strokeWidth = 8 }) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${size} flex items-center justify-center`}>
                <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r={radius} className={`fill-none stroke-slate-700/50`} strokeWidth={strokeWidth} />
                    <circle cx="50%" cy="50%" r={radius} className={`fill-none ${strokeColor} transition-all drop-shadow-[0_0_4px_currentColor]`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                </svg>
                <span className={`absolute ${fontSize} font-bold font-mono drop-shadow-[0_0_5px_currentColor] ${color}`}>{value}</span>
            </div>
            <span className="text-[8px] lg:text-xs text-slate-400 uppercase mt-1">{label}</span>
        </div>
    );
};

const AlarmItem = ({ label, count, color }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${color}`}></div>
            <span className="text-slate-300 text-sm">{label}</span>
        </div>
        <span className="text-white font-mono font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{count}</span>
    </div>
);

const Toast = ({ message, type = 'success', show }) => {
    if (!show) return null;
    const Icon = type === 'success' ? Check : Info;
    const colorClass = type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-blue-500/10 border-blue-500/50 text-blue-400';

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${colorClass}`}>
            <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                <Icon size={18} />
            </div>
            <span className="font-medium">{message}</span>
        </div>
    );
};

// --- PAGE VIEWS (LAYOUTS) ---

const HomeView = ({ coolingData, upsData, envData, systemData }) => (
    <div className="grid grid-cols-3 grid-rows-[auto_auto] gap-2 lg:gap-6 h-full pb-6">

        {/* 1. Alarm Status */}
        <Card title="Alarm Status" className="bg-slate-800/80">
            <div className="flex flex-row items-center justify-between h-full px-2">
                <div className="flex-1 space-y-1 mr-4">
                    <AlarmItem label="Notice" count={0} color="bg-blue-500" />
                    <AlarmItem label="General Alarm" count={1} color="bg-orange-500" />
                    <AlarmItem label="Critical Alarm" count={envData.fireStatus === 'Alarm' ? 1 : 0} color="bg-red-500" />
                </div>
                {/* Donut Chart Mockup */}
                <div className="relative w-16 h-16 lg:w-28 lg:h-28 hidden lg:flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="text-red-500 drop-shadow-[0_0_4px_currentColor]" strokeDasharray={`${envData.fireStatus === 'Alarm' ? 25 : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="text-orange-500 drop-shadow-[0_0_4px_currentColor]" strokeDasharray="15, 100" strokeDashoffset="-25" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-lg lg:text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] hidden lg:block">{envData.fireStatus === 'Alarm' ? 2 : 1}</span>
                    </div>
                </div>
            </div>
        </Card>

        {/* 2. UPS Mode */}
        <Card title="UPS Mode" className="bg-slate-800/80">
            <div className="flex flex-col items-center justify-center h-full gap-2 lg:gap-4 py-3 lg:py-4">
                <div className="flex items-center gap-1 lg:gap-2 w-full px-1 lg:px-4 justify-center">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="text-[8px] lg:text-xs text-slate-400">Input</div>
                        <div className="px-1 py-0.5 lg:px-1.5 lg:py-1 bg-cyan-500 text-white text-[8px] lg:text-xs font-bold rounded min-w-[30px] lg:min-w-[40px] text-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">{upsData.upsState === 'Mains' ? upsData.inputVoltage : 0}V</div>
                    </div>
                    <div className="w-8 lg:flex-1 h-[2px] bg-slate-600 relative min-w-[10px] mt-3 lg:mt-4">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 lg:w-8 lg:h-8 border-2 border-slate-500 bg-slate-800 rounded flex items-center justify-center">
                            <Zap size={10} className="text-slate-400 lg:hidden" />
                            <Zap size={14} className="text-slate-400 hidden lg:block" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="text-[8px] lg:text-xs text-slate-400">Output</div>
                        <div className="px-1 py-0.5 lg:px-1.5 lg:py-1 bg-cyan-500 text-white text-[8px] lg:text-xs font-bold rounded min-w-[30px] lg:min-w-[40px] text-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">{upsData.outputVoltage}V</div>
                    </div>
                </div>
                <div className="flex gap-2 lg:gap-4 mt-2">
                    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full shadow-[0_0_8px_currentColor] ${upsData.upsState === 'Mains' ? 'bg-green-500 text-green-500' : 'bg-slate-700 text-slate-700'}`}></div>
                    <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full shadow-[0_0_8px_currentColor] ${upsData.upsState === 'Battery' ? 'bg-orange-500 text-orange-500' : 'bg-slate-700 text-slate-700'}`}></div>
                </div>
            </div>
        </Card>

        {/* 3. Cooling Status */}
        <Card title="Cooling Status" className="bg-slate-800/80">
            <div className="space-y-1 lg:space-y-3 px-1 lg:px-2">
                {[
                    { label: 'Op. Status', fullLabel: 'Operation Status', value: coolingData.compressorStatus ? 'ON' : 'OFF', unit: '' },
                    { label: 'Mode', fullLabel: 'Control Mode', value: 'Return Air', unit: '' },
                    { label: 'Supply', fullLabel: 'Supply Air Temp', value: coolingData.supplyTemp, unit: '°C' },
                    { label: 'Return', fullLabel: 'Return Air Temp', value: coolingData.returnTemp, unit: '°C' },
                    { label: 'Hum.', fullLabel: 'Return Humidity', value: '45.0', unit: '%' },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] lg:text-sm">
                        <span className="text-slate-400 hidden lg:inline">{item.fullLabel}</span>
                        <span className="text-slate-400 lg:hidden">{item.label}</span>
                        <div className="flex items-center gap-1 lg:gap-2">
                            <span className="bg-cyan-500 text-white px-1 lg:px-2 py-0.5 rounded text-[10px] lg:text-xs font-bold min-w-[30px] lg:min-w-[50px] text-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">{item.value}</span>
                            <span className="text-slate-500 w-3 lg:w-4">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* 4. Micro Environment Chart */}
        <Card title="MDC Environment" className="col-span-2 bg-slate-800/80">
            <div className="flex items-center gap-4 mb-2 px-4">
                <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-2 text-cyan-400"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div> Temperature (°C)</span>
                    <span className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div> Humidity (%RH)</span>
                </div>
            </div>
            <div className="flex flex-nowrap justify-between lg:justify-around items-center h-48 lg:h-56 w-full px-2 lg:px-4 pb-4 lg:pb-6 gap-1 lg:gap-0">
                <div className="shrink-0"><CircularGauge value={envData.coldAisleTemp} label="Avg Temp" color="text-cyan-400" strokeColor="stroke-cyan-500" size="w-16 h-16 lg:w-40 lg:h-40" radius={45} fontSize="text-sm lg:text-3xl" strokeWidth={6} /></div>
                <div className="shrink-0"><CircularGauge value={envData.coldAisleHum} label="Avg Hum" color="text-green-400" strokeColor="stroke-green-500" size="w-16 h-16 lg:w-40 lg:h-40" radius={45} fontSize="text-sm lg:text-3xl" strokeWidth={6} /></div>
                <div className="shrink-0"><CircularGauge value={85} label="Airflow" color="text-blue-400" strokeColor="stroke-blue-500" size="w-16 h-16 lg:w-40 lg:h-40" radius={45} fontSize="text-sm lg:text-3xl" strokeWidth={6} /></div>
            </div>
        </Card>
        {/* 5. Capacity / Load — Now with live PUE */}
        <Card className="bg-slate-800/80">
            <div className="flex flex-col h-full justify-between py-2 lg:py-4">
                <div className="flex flex-nowrap justify-between items-center gap-1 px-1 lg:px-2">
                    <CircularGauge value={49.9} label="UPS" color="text-blue-400" strokeColor="stroke-blue-500" size="w-10 h-10 lg:w-24 lg:h-24" radius={35} fontSize="text-[8px] lg:text-lg" strokeWidth={6} />
                    <CircularGauge value={35.2} label="COOL" color="text-cyan-400" strokeColor="stroke-cyan-500" size="w-10 h-10 lg:w-24 lg:h-24" radius={35} fontSize="text-[8px] lg:text-lg" strokeWidth={6} />
                    <CircularGauge value={systemData?.pue || 1.3} label="PUE" color="text-green-400" strokeColor="stroke-green-500" size="w-10 h-10 lg:w-24 lg:h-24" radius={35} fontSize="text-[8px] lg:text-lg" strokeWidth={6} />
                </div>
                <div className="mt-2 lg:mt-4 px-2 lg:px-4 space-y-2 lg:space-y-4">
                    <div>
                        <div className="flex justify-between text-[8px] lg:text-xs mb-0.5 lg:mb-1"><span className="text-slate-400">IT Power</span><span className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{systemData?.itPowerKW || '—'} kW</span></div>
                        <div className="h-1 lg:h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)] transition-all duration-500" style={{ width: `${Math.min(100, ((systemData?.itPowerKW || 0) / 15) * 100)}%` }}></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[8px] lg:text-xs mb-0.5 lg:mb-1"><span className="text-slate-400">Facility Power</span><span className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{systemData?.facilityPowerKW || '—'} kW</span></div>
                        <div className="h-1 lg:h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] transition-all duration-500" style={{ width: `${Math.min(100, ((systemData?.facilityPowerKW || 0) / 20) * 100)}%` }}></div></div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);

const CoolingView = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full content-start">
        <div className="lg:col-span-8 grid grid-cols-1 gap-6">
            <Card title="Cooling Unit Schematic" className="min-h-[350px] relative overflow-hidden group">

                {/* Animated Airflow Overlay */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
                    {/* Top Path (Return Air) - Left to Right */}
                    <div className="absolute top-[20%] left-[10%] right-[10%] h-16 flex items-center overflow-hidden">
                        <div className={`flex gap-16 ${data.fanStatus ? 'animate-airflow-right' : ''}`}>
                            {[...Array(8)].map((_, i) => (
                                <ArrowRight key={i} size={24} className="text-blue-500/30" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8 py-6">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-slate-400 text-sm">Return Air</span>
                        <div className="text-3xl font-mono font-bold text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]">{data.returnTemp}°C</div>
                        <Wind className={`text-slate-400 ${data.fanStatus ? 'animate-spin-slow' : ''}`} size={40} />
                    </div>

                    <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-slate-600 rounded-xl bg-slate-900/30 relative z-20 backdrop-blur-sm">
                        <Activity className={`text-cyan-400 ${data.compressorStatus ? 'animate-pulse' : 'opacity-30'}`} size={32} />
                        <span className="text-xs text-slate-500 uppercase">Compressor</span>
                        <StatusBadge active={data.compressorStatus} />
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <span className="text-slate-400 text-sm">Supply Air</span>
                        <div className="text-4xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{data.supplyTemp}°C</div>
                        <Thermometer className="text-cyan-400" size={40} />
                    </div>
                </div>
                {/* High Temp Alarm Status Row */}
                <div className="relative z-10 mt-auto mx-2 mb-2 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
                    <span className="text-slate-300 font-medium text-sm uppercase tracking-wide">High Room Temperature</span>
                    <div className={`px-4 py-1 rounded font-mono text-sm font-bold border ${data.highRoomTemp ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse" : "bg-slate-800 text-slate-500 border-slate-600"}`}>
                        {data.highRoomTemp ? "YES" : "NO"}
                    </div>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-4 space-y-4">
            <ValueDisplay label="Supply Temp" value={data.supplyTemp} unit="°C" icon={Thermometer} />
            <ValueDisplay label="Return Temp" value={data.returnTemp} unit="°C" icon={Thermometer} color="text-blue-300" />
            <Card title="System Status">
                <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Compressor</span><StatusBadge active={data.compressorStatus} /></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Fan Unit</span><StatusBadge active={data.fanStatus} /></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">High Room Temp</span><StatusBadge active={data.highRoomTemp} labelOn="YES" labelOff="NO" type="alarm" /></div>
                </div>
            </Card>
        </div>
    </div>
);

const UPSView = ({ data, historyData }) => {
    const isBatteryMode = data.upsState === 'Battery';

    // Memoize chart data from history
    const chartData = useMemo(() => {
        if (!historyData || historyData.length === 0) return [];
        const facilityRows = historyData.filter(r => r.measurement === 'facility');
        const grouped = {};
        facilityRows.forEach(r => {
            const t = r.time;
            if (!grouped[t]) grouped[t] = { time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            grouped[t][r.field] = parseFloat(r.value?.toFixed(2));
        });
        return Object.values(grouped).slice(-30);
    }, [historyData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-8 flex flex-col gap-6">
                <Card title="Power Flow Topology" className="flex-1 min-h-[480px]">
                    <div className="flex flex-col h-full py-6 px-4">
                        <div className="flex items-start justify-between relative z-10 px-2 sm:px-8">
                            <div className="flex flex-col items-center gap-3 w-20 lg:w-24 xl:w-32 z-20">
                                <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg bg-slate-800 border-2 ${!isBatteryMode ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-600'} flex items-center justify-center shadow-lg`}><Plug className={isBatteryMode ? "text-slate-600" : "text-emerald-400 drop-shadow-[0_0_8px_currentColor]"} size={24} /></div>
                                <span className="text-xs lg:text-sm font-bold text-slate-300 mt-2">MAINS</span>
                            </div>
                            <div className="flex-1 h-1 bg-slate-700 mt-6 lg:mt-7 xl:mt-8 relative">{!isBatteryMode && (<div className="absolute inset-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>)}</div>
                            <div className="flex flex-col items-center gap-2 w-28 lg:w-32 xl:w-40 z-20 -mt-2 lg:-mt-4">
                                <div className={`w-24 h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-xl border-2 ${isBatteryMode ? 'border-orange-500 bg-orange-900/10' : 'border-emerald-500 bg-emerald-900/10'} flex flex-col items-center justify-center bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                                    <Zap className={isBatteryMode ? "text-orange-500 animate-pulse" : "text-emerald-400 drop-shadow-[0_0_8px_currentColor]"} size={40} />
                                    <span className="mt-2 text-xs font-mono text-slate-400">Mode: {data.upsState}</span>
                                </div>
                            </div>
                            <div className="flex-1 h-1 bg-slate-700 mt-6 lg:mt-7 xl:mt-8 relative"><div className={`absolute inset-0 ${isBatteryMode ? 'bg-orange-500' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`}></div></div>
                            <div className="flex flex-col items-center gap-3 w-20 lg:w-24 xl:w-32 z-20">
                                <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg bg-slate-800 border-2 ${isBatteryMode ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'} flex items-center justify-center shadow-lg`}><Server className="text-cyan-400 drop-shadow-[0_0_8px_currentColor]" size={24} /></div>
                                <span className="text-xs lg:text-sm font-bold text-slate-300 mt-2">LOAD</span>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center relative min-h-[40px] lg:min-h-[60px]"><div className={`w-1 h-full ${isBatteryMode ? 'bg-orange-500' : 'bg-slate-700'}`}></div></div>
                        <div className="flex justify-center pb-4">
                            <div className={`w-full max-w-[200px] lg:w-48 p-4 rounded-xl bg-slate-800 border ${isBatteryMode ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'border-slate-700'} flex items-center gap-4 shadow-lg z-20 relative`}>
                                <Battery className={isBatteryMode ? "text-orange-400" : "text-green-400 drop-shadow-[0_0_8px_currentColor]"} size={28} />
                                <div><div className="text-[10px] lg:text-xs text-slate-400 uppercase">Battery Bank</div><div className="text-sm lg:text-lg font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{data.batteryVoltage}V</div></div>
                            </div>
                        </div>
                    </div>
                </Card>
                {/* Historical Power Chart (Phase 2 - 02-03) */}
                <Card title="Facility Power History">
                    <div className="h-48 lg:h-64 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} labelStyle={{ color: '#e2e8f0' }} />
                                    <Line type="monotone" dataKey="it_power_kw" name="IT Power (kW)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="facility_power_kw" name="Facility (kW)" stroke="#22c55e" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="pue" name="PUE" stroke="#a78bfa" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                <Activity className="mr-2 animate-pulse" size={16} /> Collecting power history data...
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-4 space-y-4">
                <ValueDisplay label="Input Voltage" value={data.inputVoltage} unit="V" icon={Plug} color="text-emerald-400" />
                <ValueDisplay label="Output Voltage" value={data.outputVoltage} unit="V" icon={Zap} color="text-cyan-400" />
                <Card title="Battery Status">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-900/50 p-2 rounded"><div className="text-[10px] text-slate-500 mb-1">CHARGING</div><div className="font-mono text-lg text-green-400 drop-shadow-[0_0_5px_currentColor]">{data.chargingCurrent}A</div></div>
                        <div className="bg-slate-900/50 p-2 rounded"><div className="text-[10px] text-slate-500 mb-1">DISCHARGING</div><div className="font-mono text-lg text-orange-400 drop-shadow-[0_0_5px_currentColor]">{data.dischargingCurrent}A</div></div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const EnvironmentView = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full content-start">
        <Card title="Aisle Conditions">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 text-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <span className="text-blue-200 font-bold text-sm uppercase block mb-2">Cold Aisle</span>
                    <div className="text-3xl font-mono text-blue-100 drop-shadow-[0_0_8px_rgba(191,219,254,0.6)]">{data.coldAisleTemp}°C</div>
                    <div className="text-sm text-blue-400 mt-2">{data.coldAisleHum}% RH</div>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20 text-center shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <span className="text-orange-200 font-bold text-sm uppercase block mb-2">Hot Aisle</span>
                    <div className="text-3xl font-mono text-orange-100 drop-shadow-[0_0_8px_rgba(255,237,213,0.6)]">{data.hotAisleTemp}°C</div>
                    <div className="text-sm text-orange-400 mt-2">{data.hotAisleHum}% RH</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 text-center">
                    <span className="text-slate-400 font-bold text-xs uppercase block mb-1">Airflow</span>
                    <div className="text-xl font-mono text-white">{data.airflow} <span className="text-xs text-slate-500">CFM</span></div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 text-center">
                    <span className="text-slate-400 font-bold text-xs uppercase block mb-1">Pressure</span>
                    <div className="text-xl font-mono text-white">{data.pressure} <span className="text-xs text-slate-500">Pa</span></div>
                </div>
            </div>
        </Card>
        <div className="flex flex-col gap-6">
            <Card title="Doors">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2 bg-slate-900/50 rounded"><span className="text-xs text-slate-500 uppercase block mb-1">Front</span><span className={`font-bold ${data.frontDoorOpen ? 'text-orange-400' : 'text-slate-300'}`}>{data.frontDoorOpen ? 'OPEN' : 'CLOSED'}</span></div>
                    <div className="text-center p-2 bg-slate-900/50 rounded"><span className="text-xs text-slate-500 uppercase block mb-1">Back</span><span className={`font-bold ${data.backDoorOpen ? 'text-orange-400' : 'text-slate-300'}`}>{data.backDoorOpen ? 'OPEN' : 'CLOSED'}</span></div>
                </div>
            </Card>
            <Card title="Critical Sensors">
                <div className="space-y-4">
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-slate-300"><Flame size={18} className={data.smokeDetected ? 'text-red-500' : ''} /> SMOKE</span><StatusBadge active={data.smokeDetected} labelOn="ALARM" labelOff="NORMAL" type="alarm" /></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-slate-300"><Droplets size={18} className={data.waterLeak ? 'text-blue-400' : ''} /> LEAK CABLE</span><StatusBadge active={data.waterLeak} labelOn="ALARM" labelOff="NORMAL" type="alarm" /></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-slate-300"><Flame size={18} className={data.fireStatus === 'Alarm' ? 'text-red-500' : ''} /> FIRE SYSTEM</span><StatusBadge active={data.fireStatus === 'Alarm'} labelOn="ALARM" labelOff="NORMAL" type="alarm" /></div>
                </div>
            </Card>
        </div>
    </div>
);

const PDUView = ({ data, historyData }) => {
    // Memoize chart data from history for PDU power trends
    const chartData = useMemo(() => {
        if (!historyData || historyData.length === 0) return [];
        const facilityRows = historyData.filter(r => r.measurement === 'facility');
        const grouped = {};
        facilityRows.forEach(r => {
            const t = r.time;
            if (!grouped[t]) grouped[t] = { time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            grouped[t][r.field] = parseFloat(r.value?.toFixed(2));
        });
        return Object.values(grouped).slice(-30);
    }, [historyData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 h-full content-start">
            {['pdu1', 'pdu2'].map((pduKey, idx) => (
                <Card key={pduKey} title={`PDU-${idx + 1} Status`}>
                    <div className="space-y-2 lg:space-y-4">
                        <div className="flex items-center justify-center py-2 lg:py-4">
                            <div className={`w-14 h-14 lg:w-20 lg:h-20 rounded-full border-2 lg:border-4 ${idx === 0 ? 'border-cyan-500' : 'border-blue-500'} flex items-center justify-center bg-slate-900/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                                <Plug className={`w-6 h-6 lg:w-8 lg:h-8 ${idx === 0 ? "text-cyan-400" : "text-blue-400"}`} />
                            </div>
                        </div>
                        <div className="space-y-1 lg:space-y-2">
                            <ValueDisplay label="Voltage" value={data[pduKey].voltage} unit="V" icon={Zap} color={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                            <ValueDisplay label="Current" value={data[pduKey].current} unit="A" icon={Activity} color={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                            <ValueDisplay label="Frequency" value={data[pduKey].frequency} unit="Hz" icon={Activity} color="text-slate-400" />
                            <ValueDisplay label="Act Energy" value={data[pduKey].energy} unit="kWh" icon={Zap} color="text-green-400" />
                            <ValueDisplay label="PF" value={data[pduKey].powerFactor} unit="" icon={Activity} color="text-orange-400" />
                        </div>
                        {/* Phase 2 - 02-01: Granular Outlet Grid */}
                        {data[pduKey].outlets && data[pduKey].outlets.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] lg:text-xs text-slate-400 uppercase font-semibold tracking-wider">Outlet Circuits ({data[pduKey].outlets.length})</span>
                                    <div className="flex gap-2 text-[8px] lg:text-[10px]">
                                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Normal</span>
                                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>High</span>
                                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>Critical</span>
                                    </div>
                                </div>
                                <div className="overflow-y-auto max-h-[260px] custom-scrollbar rounded-lg border border-slate-700/30 bg-slate-900/40">
                                    <div className="grid grid-cols-4 lg:grid-cols-6 gap-1 p-2">
                                        {data[pduKey].outlets.map((outlet) => {
                                            const loadPercent = (outlet.current / outlet.maxCurrent) * 100;
                                            const ledColor = outlet.status === 'critical'
                                                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                                                : outlet.status === 'high'
                                                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                                                    : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
                                            const borderColor = outlet.status === 'critical'
                                                ? 'border-red-500/30'
                                                : outlet.status === 'high'
                                                    ? 'border-amber-500/30'
                                                    : 'border-slate-700/30';
                                            return (
                                                <div key={outlet.id} className={`flex flex-col items-center p-1.5 rounded-lg bg-slate-800/60 border ${borderColor} transition-all hover:bg-slate-700/60 group`} title={`${outlet.label}: ${outlet.current}A / ${outlet.maxCurrent}A (${loadPercent.toFixed(0)}%)`}>
                                                    <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${ledColor} transition-all`}></div>
                                                    <span className="text-[7px] lg:text-[9px] text-slate-500 mt-1 font-mono">{outlet.id}</span>
                                                    <span className="text-[7px] lg:text-[9px] text-slate-400 font-mono font-bold group-hover:text-white transition-colors">{outlet.current}A</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
            {/* Phase 2 - 02-03: PDU Historical Power Chart */}
            <Card title="PDU Power Trends" className="col-span-1 lg:col-span-2">
                <div className="h-48 lg:h-64 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} labelStyle={{ color: '#e2e8f0' }} />
                                <Line type="monotone" dataKey="pdu1_current" name="PDU-1 Current (A)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="pdu2_current" name="PDU-2 Current (A)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="pue" name="PUE" stroke="#a78bfa" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                            <Activity className="mr-2 animate-pulse" size={16} /> Collecting PDU power history...
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

// --- Phase 3: ASSET METADATA DRAWER ---
const AssetDrawer = ({ asset, model, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: asset?.name || '', serialNumber: asset?.serialNumber || '', assetTag: asset?.assetTag || '',
        ipAddress: asset?.ipAddress || '', owner: asset?.owner || '', notes: asset?.notes || '', status: asset?.status || 'Active'
    });
    const statusColors = { Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', Spare: 'bg-blue-500/20 text-blue-400 border-blue-500/30', Decommissioned: 'bg-slate-500/20 text-slate-400 border-slate-600/30' };

    if (!asset || !model) return null;
    const handleSave = () => {
        fetch(`http://localhost:5000/api/assets/${asset.assetId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        }).then(r => r.json()).then(() => { onSave && onSave(); }).catch(() => {});
    };

    return (
        <div className="fixed right-0 top-0 bottom-0 w-96 z-[60] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl flex flex-col animate-slide-in">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                    <div className="text-sm font-bold text-slate-200">{model.manufacturer} {model.modelName}</div>
                    <div className="text-[10px] text-slate-400">{model.heightU}U | {model.maxPowerW}W | {model.weight}kg</div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                <div className="flex gap-2 mb-3">
                    {['Active', 'Spare', 'Decommissioned'].map(s => (
                        <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border ${form.status === s ? statusColors[s] : 'bg-slate-800 text-slate-500 border-slate-700'} transition-colors`}>{s}</button>
                    ))}
                </div>
                {[{ key: 'name', label: 'Asset Name', icon: Edit3 }, { key: 'serialNumber', label: 'Serial Number', icon: Info }, { key: 'assetTag', label: 'Asset Tag', icon: Info },
                  { key: 'ipAddress', label: 'IP Address', icon: Wifi }, { key: 'owner', label: 'Owner', icon: Info }].map(({ key, label, icon: Ic }) => (
                    <div key={key}>
                        <label className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1"><Ic size={10} /> {label}</label>
                        <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors mt-1" />
                    </div>
                ))}
                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors mt-1" />
                </div>
                <div className="border-t border-slate-700/50 pt-3 mt-3">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Front Ports ({model.frontPorts?.length || 0})</div>
                    <div className="flex flex-wrap gap-1">{(model.frontPorts || []).map((p, i) => (
                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded ${portColorMap[p.type] || 'bg-slate-600'} text-white font-mono`}>{p.label}</span>
                    ))}</div>
                </div>
                <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Rear Ports ({model.rearPorts?.length || 0})</div>
                    <div className="flex flex-wrap gap-1">{(model.rearPorts || []).map((p, i) => (
                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded ${portColorMap[p.type] || 'bg-slate-600'} text-white font-mono`}>{p.label}</span>
                    ))}</div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-700">
                <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg font-semibold text-sm transition-colors">
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </div>
    );
};

// --- RACK DESIGNER VIEW (Phase 3 Upgrade) ---
const RackDesignerView = ({ rackItems, handleDrop, handleRemove, handleDragStart, modelLibrary, totalPower, totalWeight, totalU, onSelectAsset, connections, onPortClick, connectMode, tracedConnection, onDeleteConnection, onTraceConnection, showToast }) => {
    const [rackFace, setRackFace] = useState('front');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredModels = useMemo(() => {
        return modelLibrary.filter(m => {
            const matchesSearch = m.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || m.deviceType === filterType;
            return matchesSearch && matchesType;
        });
    }, [modelLibrary, searchTerm, filterType]);

    const isPortConnected = useCallback((assetId, portLabel) => {
        return connections.some(c =>
            (c.srcAssetId === assetId && c.srcPortLabel === portLabel) ||
            (c.dstAssetId === assetId && c.dstPortLabel === portLabel)
        );
    }, [connections]);

    const isTracedPort = useCallback((assetId, portLabel) => {
        if (!tracedConnection) return false;
        const conn = connections.find(c => c.connectionId === tracedConnection);
        if (!conn) return false;
        return (conn.srcAssetId === assetId && conn.srcPortLabel === portLabel) ||
               (conn.dstAssetId === assetId && conn.dstPortLabel === portLabel);
    }, [tracedConnection, connections]);

    const getAssetName = useCallback((assetId) => {
        const slot = rackItems.find(i => i && i.assetId === assetId && i.type === 'anchor');
        return slot?.name || `Asset #${assetId}`;
    }, [rackItems]);

    const filterTabs = [{ key: 'all', label: 'All' }, { key: 'server', label: 'Servers' }, { key: 'network', label: 'Network' }, { key: 'power', label: 'Power' }, { key: 'storage', label: 'Storage' }];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full content-start">
            {/* Asset Catalog */}
            <Card title="Asset Catalog" className="lg:col-span-3 h-full">
                <div className="space-y-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search models..."
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors" />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        {filterTabs.map(t => (
                            <button key={t.key} onClick={() => setFilterType(t.key)}
                                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${filterType === t.key ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{t.label}</button>
                        ))}
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {filteredModels.map(model => {
                            const IconComp = iconMap[model.icon] || Server;
                            return (
                                <div key={model.modelId} draggable onDragStart={(e) => handleDragStart(e, model)}
                                    className="p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded flex items-center justify-center ${model.color} text-white shadow-lg shrink-0`}>
                                            <IconComp size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-slate-200 truncate">{model.manufacturer} {model.modelName}</div>
                                            <div className="text-[10px] text-slate-400">{model.heightU}U | {model.maxPowerW}W | {model.weight}kg</div>
                                            <div className="text-[9px] text-slate-500 mt-0.5">
                                                F:{model.frontPorts?.length || 0} R:{model.rearPorts?.length || 0} ports
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredModels.length === 0 && <div className="text-slate-500 text-xs text-center py-4">No models found</div>}
                    </div>
                </div>
            </Card>

            {/* Rack Elevation */}
            <Card title={`Server Rack 01 (42U) — ${rackFace === 'front' ? 'Front' : 'Rear'}`} className="lg:col-span-6 min-h-[800px] flex flex-col bg-slate-900">
                <div className="flex justify-center gap-2 mb-3">
                    <button onClick={() => setRackFace('front')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${rackFace === 'front' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <Eye size={12} className="inline mr-1.5" />Front
                    </button>
                    <button onClick={() => setRackFace('rear')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${rackFace === 'rear' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <Layers size={12} className="inline mr-1.5" />Rear
                    </button>
                </div>
                {connectMode && (
                    <div className="mb-2 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded-lg text-xs text-yellow-300 flex items-center gap-2">
                        <Cable size={14} className="animate-pulse" /> Connect mode: click destination port or press Esc to cancel.
                    </div>
                )}
                <div className="w-full max-w-md mx-auto bg-black border-x-4 border-slate-700 relative p-1 shadow-2xl flex-1">
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-slate-800 border-r border-slate-600/50 flex flex-col justify-around py-2">
                        {Array(42).fill(0).map((_, i) => <div key={i} className="text-[8px] text-slate-500 text-center font-mono">{42 - i}</div>)}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-slate-800 border-l border-slate-600/50 flex flex-col justify-around py-2">
                        {Array(42).fill(0).map((_, i) => <div key={i} className="text-[8px] text-slate-500 text-center font-mono">{42 - i}</div>)}
                    </div>
                    <div className="mx-6 flex flex-col h-full border-x border-dashed border-slate-800/50">
                        {Array(42).fill(null).map((_, i) => {
                            const uIndex = 41 - i;
                            const item = rackItems[uIndex];
                            const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; e.currentTarget.classList.add('bg-cyan-500/20'); };
                            const onDragLeave = (e) => { e.currentTarget.classList.remove('bg-cyan-500/20'); };
                            const onDropSlot = (e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-cyan-500/20'); handleDrop(uIndex); };
                            const isAnchor = item && item.type === 'anchor';
                            const IconComp = item ? (iconMap[item.icon] || Server) : null;

                            // Get ports for current face
                            const ports = isAnchor ? (rackFace === 'front' ? (item.frontPorts || []) : [...(item.rearPorts || [])].reverse()) : [];

                            return (
                                <div key={uIndex}
                                    className={`h-[1.75rem] border-b border-slate-800 relative group transition-colors flex items-center justify-center text-[9px] text-slate-700 select-none ${!item ? 'hover:bg-slate-800' : ''}`}
                                    onDragOver={!item ? onDragOver : undefined}
                                    onDragLeave={!item ? onDragLeave : undefined}
                                    onDrop={!item ? onDropSlot : undefined}
                                    onContextMenu={(e) => { e.preventDefault(); handleRemove(uIndex); }}>
                                    {!item && <span>Slot {uIndex + 1}</span>}
                                    {isAnchor && (
                                        <div onClick={() => onSelectAsset && onSelectAsset(item)}
                                            className={`absolute top-0 left-0 right-0 z-10 m-[1px] rounded shadow-lg flex items-center px-2 gap-1 ${item.color} border-t border-white/20 cursor-pointer hover:brightness-110 transition-all`}
                                            style={{ height: `calc(${item.heightU * 1.75}rem - 2px)` }}>
                                            {IconComp && <IconComp size={12} className="text-white/80 shrink-0" />}
                                            <span className="font-bold text-white text-[9px] truncate">{item.name}</span>
                                            <div className="flex gap-[2px] ml-auto shrink-0">
                                                {ports.slice(0, 8).map((port, pi) => (
                                                    <div key={pi}
                                                        onClick={(e) => { e.stopPropagation(); onPortClick && onPortClick(item.assetId, port.label, port.type); }}
                                                        className={`w-2.5 h-2.5 rounded-sm border cursor-pointer transition-all
                                                            ${portColorMap[port.type] || 'bg-slate-600'} border-white/20 hover:scale-150 hover:z-20
                                                            ${isPortConnected(item.assetId, port.label) ? 'ring-1 ring-cyan-400 ring-offset-1 ring-offset-slate-900' : ''}
                                                            ${connectMode?.assetId === item.assetId && connectMode?.portLabel === port.label ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
                                                            ${isTracedPort(item.assetId, port.label) ? 'ring-2 ring-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''}`}
                                                        title={`${port.label} (${port.type})`} />
                                                ))}
                                                {ports.length > 8 && <span className="text-[7px] text-white/40">+{ports.length - 8}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Rack Metrics + Connections */}
            <div className="lg:col-span-3 space-y-4">
                <Card title="Rack Metrics" className="h-auto">
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-sm text-slate-400 mb-2">Total Power Load</div>
                            <CircularGauge value={(totalPower / 12 * 100).toFixed(1)} label={`${totalPower} / 12 kW`} color="text-cyan-400" strokeColor="stroke-cyan-500" size="w-32 h-32" />
                        </div>
                        <div className="space-y-4 px-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-slate-400"><span>Weight (Max 1000kg)</span><span>{totalWeight} kg</span></div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${totalWeight / 1000 * 100}%` }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1 text-slate-400"><span>U-Space Used</span><span>{totalU} / 42 U</span></div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${totalU / 42 * 100}%` }}></div></div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs text-slate-400 leading-relaxed">
                            <div className="flex gap-2 mb-2"><Info size={14} className="text-cyan-400 shrink-0" /> <span>Drag assets from catalog.</span></div>
                            <div className="flex gap-2 mb-2"><ArrowDown size={14} className="text-red-400 shrink-0" /> <span>Right-click to remove.</span></div>
                            <div className="flex gap-2"><Cable size={14} className="text-yellow-400 shrink-0" /> <span>Click ports to connect.</span></div>
                        </div>
                        {/* Port Legend */}
                        <div className="space-y-1">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Port Types</div>
                            {Object.entries(portColorMap).map(([type, color]) => (
                                <div key={type} className="flex items-center gap-2 text-xs text-slate-400">
                                    <div className={`w-3 h-3 rounded-sm ${color}`}></div>
                                    {type}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Connections Panel */}
                <Card title={`Connections (${connections.length})`} className="h-auto">
                    {connections.length === 0 ? (
                        <div className="text-slate-500 text-sm text-center py-4">No connections yet.<br /><span className="text-[10px]">Click a port to start.</span></div>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {connections.map(conn => (
                                <div key={conn.connectionId} className={`flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg border transition-all ${tracedConnection === conn.connectionId ? 'border-emerald-500/50 bg-emerald-900/20' : 'border-slate-700/30'}`}>
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: conn.color }}></div>
                                    <div className="flex-1 text-[10px] min-w-0">
                                        <span className="text-cyan-400">{getAssetName(conn.srcAssetId)}</span>
                                        <span className="text-slate-500">:{conn.srcPortLabel}</span>
                                        <span className="text-slate-600 mx-1">→</span>
                                        <span className="text-cyan-400">{getAssetName(conn.dstAssetId)}</span>
                                        <span className="text-slate-500">:{conn.dstPortLabel}</span>
                                    </div>
                                    <button onClick={() => onTraceConnection(conn.connectionId)}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-900/50 shrink-0">Trace</button>
                                    <button onClick={() => onDeleteConnection(conn.connectionId)}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-500/20 hover:bg-red-900/50 shrink-0">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// --- MAIN APP ---

export default function DCIM() {
    const [activeTab, setActiveTab] = useState('home');
    const [showSim, setShowSim] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile, checked in useEffect for desktop
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });



    // Set sidebar open on desktop by default
    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);

    // Toast Logic
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    // Listen for custom 'show-toast' events from child components (like ValueDisplay)
    useEffect(() => {
        const handleCustomToast = (e) => {
            showToast(e.detail.message, e.detail.type);
        };
        window.addEventListener('show-toast', handleCustomToast);
        return () => window.removeEventListener('show-toast', handleCustomToast);
    }, []);

    // Real-time Data Hook
    const { data: realtimeData, isConnected, historyData } = useRealtimeData({
        upsData: { inputVoltage: 0, outputVoltage: 0, upsState: 'Offline', batteryVoltage: 0, chargingCurrent: 0, dischargingCurrent: 0 },
        coolingData: { supplyTemp: 0, returnTemp: 0, compressorStatus: false, fanStatus: false, highRoomTemp: false },
        envData: { coldAisleTemp: 0, coldAisleHum: 0, hotAisleTemp: 0, hotAisleHum: 0, fireStatus: 'Normal', leakageStatus: 'Normal', frontDoorOpen: false, backDoorOpen: false, outdoorTemp: 18.2, airflow: 0, pressure: 0, smokeDetected: false, waterLeak: false, history: [] },
        pduData: { pdu1: { voltage: 0, current: 0, frequency: 0, energy: 0, powerFactor: 0, outlets: [] }, pdu2: { voltage: 0, current: 0, frequency: 0, energy: 0, powerFactor: 0, outlets: [] } },
        system: { connected: false, status: 'OK', pue: 1.3, itPowerKW: 0, facilityPowerKW: 0 }
    });

    if (!realtimeData) return <div className="p-10 text-red-500">Error: No Data Connection</div>;
    const { upsData, coolingData, envData, pduData, system: systemData } = realtimeData;

    // New Outdoor Temp State (Managed by Backend now, fallback for initial render)
    const outdoorTemp = envData?.outdoorTemp || 18.2;

    // --- MOCK STATE & SIMULATION LOOP REMOVED (Now handled by Backend) ---

    // Sim Actions (Triggers backend toggles)
    const toggleFire = () => fetch('http://localhost:5000/api/simulate/fire', { method: 'POST' }).catch(() => showToast("Backend unreached.", "error"));
    const toggleLeak = () => fetch('http://localhost:5000/api/simulate/leak', { method: 'POST' }).catch(() => showToast("Backend unreached.", "error"));
    const toggleUPS = () => showToast("UPS Test: Backend toggle not implemented.", "info");

    // Export Data Logic
    const handleExport = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Prompt for filename
        let fileName = window.prompt("Enter file name for export:", `dcim-report-${timestamp}`);
        if (!fileName) return; // User cancelled
        if (!fileName.endsWith('.csv')) fileName += '.csv';

        const headers = ["Category", "Metric", "Value", "Unit"];
        const rows = [
            // Cooling
            ["Cooling", "Supply Temp", coolingData.supplyTemp, "°C"],
            ["Cooling", "Return Temp", coolingData.returnTemp, "°C"],
            ["Cooling", "Compressor", coolingData.compressorStatus ? "ON" : "OFF", ""],
            // UPS
            ["UPS", "State", upsData.upsState, ""],
            ["UPS", "Input Voltage", upsData.inputVoltage, "V"],
            ["UPS", "Output Voltage", upsData.outputVoltage, "V"],
            ["UPS", "Battery Voltage", upsData.batteryVoltage, "V"],
            // PDU 1
            ["PDU-1", "Voltage", pduData.pdu1.voltage, "V"],
            ["PDU-1", "Current", pduData.pdu1.current, "A"],
            ["PDU-1", "Energy", pduData.pdu1.energy, "kWh"],
            // PDU 2
            ["PDU-2", "Voltage", pduData.pdu2.voltage, "V"],
            ["PDU-2", "Current", pduData.pdu2.current, "A"],
            ["PDU-2", "Energy", pduData.pdu2.energy, "kWh"],
            // Environment
            ["Environment", "Cold Aisle Temp", envData.coldAisleTemp, "°C"],
            ["Environment", "Hot Aisle Temp", envData.hotAisleTemp, "°C"],
            ["Environment", "Fire Status", envData.fireStatus, ""],
            ["Environment", "Leak Status", envData.leakageStatus, ""]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Exported: ${fileName}`, 'success');
    };

    // Idle Timeout Logic
    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setActiveTab('home');
            }, 300000); // 5 minutes
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();

        return () => {
            clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, []);

    // Fullscreen Logic
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen().catch((err) => {
                console.error(`Error attempting to exit fullscreen mode: ${err.message} (${err.name})`);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Keyboard Shortcuts (Fullscreen Only)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key.toLowerCase() === 'f') {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- RACK DESIGNER LOGIC (Phase 3 Upgrade) ---
    const [rackItems, setRackItems] = useState(Array(42).fill(null));
    const [draggedAsset, setDraggedAsset] = useState(null);
    const [modelLibrary, setModelLibrary] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [connections, setConnections] = useState([]);
    const [connectMode, setConnectMode] = useState(null);
    const [tracedConnection, setTracedConnection] = useState(null);

    // Fetch model library from backend
    useEffect(() => {
        fetch('http://localhost:5000/api/models').then(r => r.json()).then(setModelLibrary).catch(() => {});
        fetch('http://localhost:5000/api/connections').then(r => r.json()).then(setConnections).catch(() => {});
    }, []);

    // Listen for connection updates via socket
    useEffect(() => {
        const handler = (e) => setConnections(e.detail);
        window.addEventListener('connections-update', handler);
        return () => window.removeEventListener('connections-update', handler);
    }, []);

    // Escape key cancels connect mode
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setConnectMode(null); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleDragStart = (e, model) => {
        setDraggedAsset(model);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = async (index) => {
        if (!draggedAsset) return;
        const u = draggedAsset.heightU;
        if (index + 1 < u) return;

        let collision = false;
        for (let i = 0; i < u; i++) { if (rackItems[index - i]) collision = true; }
        if (collision) { showToast("Not enough space!", "error"); return; }

        try {
            const res = await fetch('http://localhost:5000/api/assets', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelId: draggedAsset.modelId, name: `${draggedAsset.manufacturer} ${draggedAsset.modelName}`, rackSlotU: index })
            });
            const asset = await res.json();

            const newRack = [...rackItems];
            for (let i = 0; i < u; i++) {
                newRack[index - i] = {
                    ...draggedAsset, assetId: asset.assetId, name: asset.name,
                    type: i === 0 ? 'anchor' : 'filled', anchorId: index
                };
            }
            setRackItems(newRack);
        } catch { showToast("Backend unreachable.", "error"); }
        setDraggedAsset(null);
    };

    const handleRemove = async (index) => {
        const item = rackItems[index];
        if (!item) return;
        const anchorIndex = item.type === 'anchor' ? index : item.anchorId;
        const anchorItem = rackItems[anchorIndex];
        if (!anchorItem) return;

        if (anchorItem.assetId) {
            try { await fetch(`http://localhost:5000/api/assets/${anchorItem.assetId}`, { method: 'DELETE' }); } catch {}
        }
        const newRack = [...rackItems];
        for (let i = 0; i < anchorItem.heightU; i++) { newRack[anchorIndex - i] = null; }
        setRackItems(newRack);
        if (selectedAsset?.assetId === anchorItem.assetId) setSelectedAsset(null);
    };

    const handlePortClick = (assetId, portLabel, portType) => {
        if (!connectMode) {
            setConnectMode({ assetId, portLabel, portType });
            showToast(`Source: ${portLabel} selected. Click destination port.`, 'info');
        } else {
            if (connectMode.assetId === assetId && connectMode.portLabel === portLabel) {
                setConnectMode(null); return;
            }
            fetch('http://localhost:5000/api/connections', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ srcAssetId: connectMode.assetId, srcPortLabel: connectMode.portLabel, dstAssetId: assetId, dstPortLabel: portLabel, cableType: connectMode.portType === 'PWR' ? 'power' : 'copper' })
            }).then(r => { if (!r.ok) throw new Error(); return r.json(); })
              .then(conn => { setConnections(prev => [...prev, conn]); showToast('Connection created!', 'success'); setConnectMode(null); })
              .catch(() => { showToast('Port already connected or error.', 'error'); setConnectMode(null); });
        }
    };

    const handleDeleteConnection = (connId) => {
        fetch(`http://localhost:5000/api/connections/${connId}`, { method: 'DELETE' })
            .then(() => setConnections(prev => prev.filter(c => c.connectionId !== connId)))
            .catch(() => {});
    };

    const handleTraceConnection = (connId) => {
        setTracedConnection(connId);
        setTimeout(() => setTracedConnection(null), 3000);
    };

    const handleSelectAsset = (item) => {
        const model = modelLibrary.find(m => m.modelId === item.modelId);
        setSelectedAsset({ ...item, model });
    };

    const placedAssets = rackItems.filter(i => i && i.type === 'anchor');
    const totalPower = placedAssets.reduce((acc, curr) => acc + (curr.maxPowerW || 0) / 1000, 0).toFixed(2);
    const totalWeight = placedAssets.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    const totalU = placedAssets.reduce((acc, curr) => acc + (curr.heightU || 0), 0);

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans text-slate-200 flex ${envData.fireStatus === 'Alarm' ? 'bg-red-950' : 'bg-[#0b1120]'}`}>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"></div>
            )}

            {/* Sidebar - Fixed Position */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 flex flex-col backdrop-blur-md bg-slate-900/90 border-r border-slate-800 shadow-2xl`}>
                <div className="p-6 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"><Server className="text-white" size={18} /></div>
                    <h1 className="text-xl font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">DCIM</h1>
                    <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                        <span className={`text-[10px] font-bold tracking-wider ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {[{ id: 'home', label: 'Home', icon: Home }, { id: 'cooling', label: 'Cooling', icon: Fan }, { id: 'ups', label: 'UPS Power', icon: Zap }, { id: 'pdu', label: 'PDU', icon: Plug }, { id: 'environment', label: 'Environment', icon: Droplets }, { id: 'rack-designer', label: 'Rack Designer', icon: Server }].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-cyan-900/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] border-l-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800 border-l-2 border-transparent'}`}>
                            <item.icon size={20} className={activeTab === item.id ? "drop-shadow-[0_0_5px_currentColor]" : ""} />{item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                        <Clock size={16} className="text-cyan-500" />
                        <span className="text-xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] tabular-nums">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider pl-7">
                        {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </aside>

            {/* Main Content - Pushed by Sidebar */}
            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full lg:pl-64`}>
                {/* Header - Sticky */}
                <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-cyan-400 transition-colors p-1 rounded-md hover:bg-slate-800">
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-medium text-slate-200 uppercase tracking-widest">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <div className={`p-1.5 rounded-full ${outdoorTemp < 22 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {outdoorTemp < 22 ? <Wind size={14} /> : <Sun size={14} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider leading-none">Outside</span>
                                <span className="text-sm font-bold font-mono leading-none flex items-center gap-1 tabular-nums">
                                    {outdoorTemp}°C
                                    {outdoorTemp < 22 && <span className="text-[8px] bg-emerald-500 text-white px-1 rounded ml-1">FREE COOLING</span>}
                                </span>
                            </div>
                        </div>

                        <button onClick={handleExport} className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors" title="Export Data"><Download size={14} /> Export</button>
                        <button onClick={() => { setShowSim(!showSim); showToast(`Simulator: ${!showSim ? 'ON' : 'OFF'}`, 'info'); }} className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"><Settings size={14} /> Simulator</button>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${envData.fireStatus === 'Alarm' ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                            <span className="text-xs text-slate-400 uppercase font-bold">{envData.fireStatus === 'Alarm' ? 'CRITICAL ALARM' : 'SYSTEM NORMAL'}</span>
                        </div>
                    </div>
                </header>

                {showSim && (
                    <div className="fixed top-20 right-8 w-64 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl p-4 z-50 shadow-2xl">
                        <button onClick={toggleFire} className="w-full text-left px-3 py-2 rounded bg-red-500/20 text-red-200 text-xs border border-red-500/30 mb-2 hover:bg-red-500/30 transition-colors">Toggle Fire Alarm</button>
                        <button onClick={toggleUPS} className="w-full text-left px-3 py-2 rounded bg-orange-500/20 text-orange-200 text-xs border border-orange-500/30 mb-2 hover:bg-orange-500/30 transition-colors">Toggle UPS Battery</button>
                        <button onClick={toggleLeak} className="w-full text-left px-3 py-2 rounded bg-blue-500/20 text-blue-200 text-xs border border-blue-500/30 hover:bg-blue-500/30 transition-colors">Toggle Leak</button>
                    </div>
                )}

                <div className="flex-1 p-4 lg:p-8">
                    {activeTab === 'home' && <HomeView coolingData={coolingData} upsData={upsData} envData={envData} systemData={systemData} />}
                    {activeTab === 'cooling' && <CoolingView data={coolingData} />}
                    {activeTab === 'ups' && <UPSView data={upsData} historyData={historyData} />}
                    {activeTab === 'pdu' && <PDUView data={pduData} historyData={historyData} />}
                    {activeTab === 'environment' && <EnvironmentView data={envData} />}
                    {activeTab === 'rack-designer' && <RackDesignerView
                        rackItems={rackItems}
                        handleDrop={handleDrop}
                        handleRemove={handleRemove}
                        handleDragStart={handleDragStart}
                        modelLibrary={modelLibrary}
                        totalPower={totalPower}
                        totalWeight={totalWeight}
                        totalU={totalU}
                        onSelectAsset={handleSelectAsset}
                        connections={connections}
                        onPortClick={handlePortClick}
                        connectMode={connectMode}
                        tracedConnection={tracedConnection}
                        onDeleteConnection={handleDeleteConnection}
                        onTraceConnection={handleTraceConnection}
                        showToast={showToast}
                    />}
                </div>

                {/* Asset Drawer */}
                {selectedAsset && (
                    <AssetDrawer
                        asset={selectedAsset}
                        model={selectedAsset.model || modelLibrary.find(m => m.modelId === selectedAsset.modelId)}
                        onClose={() => setSelectedAsset(null)}
                        onSave={() => { showToast('Asset saved!', 'success'); setSelectedAsset(null); }}
                    />
                )}

                {/* Footer */}
                <div className="h-8 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center px-4 lg:px-8 text-[10px] lg:text-xs text-slate-500 shrink-0">
                    <span>DCIM Dashboard v1.1.0</span>
                    <span>&copy; 2025 Data Center Systems</span>
                </div>
            </main>

            {/* Fire Alarm Overlay */}
            {envData.fireStatus === 'Alarm' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-sm animate-pulse pointer-events-none">
                    <AlertTriangle size={120} className="text-red-500 mb-8 animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,1)]" />
                    <h1 className="text-9xl font-black text-red-500 tracking-widest uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                        WARNING
                    </h1>
                    <h2 className="text-4xl font-bold text-white mt-4 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                        FIRE ALARM TRIGGERED
                    </h2>
                    <button
                        onClick={toggleFire}
                        className="mt-12 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.6)] border border-red-400 pointer-events-auto transition-all hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
                    >
                        STOP ALARM
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            <Toast {...toast} />

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.8); border-radius: 3px; }
        .animate-progress-bar { animation: progress-bar 2s linear infinite; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .animate-airflow-right { animation: airflow-right 2s linear infinite; }
        @keyframes progress-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes airflow-right { 0% { transform: translateX(-20px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(20px); opacity: 0; } }
    `}</style>
        </div>
    );

}
