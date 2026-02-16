import { useState, useEffect, useRef } from 'react';
import {
    Thermometer, Wind, Zap, Droplets, DoorOpen, AlertTriangle,
    Activity, Server, Fan, Battery, Plug, Flame, Settings,
    Clock, CheckCircle2, ArrowRight, Home, Menu, Download, Maximize, Minimize, ArrowUp, ArrowDown, Info, Check, Cloud, Sun, Wifi, WifiOff
} from 'lucide-react';
import { useRealtimeData } from './hooks/useRealtimeData';

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

const HomeView = ({ coolingData, upsData, envData }) => (
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
        {/* 5. Capacity / Load */}
        <Card className="bg-slate-800/80">
            <div className="flex flex-col h-full justify-between py-2 lg:py-4">
                <div className="flex flex-nowrap justify-between items-center gap-1 px-1 lg:px-2">
                    <CircularGauge value={49.9} label="UPS" color="text-blue-400" strokeColor="stroke-blue-500" size="w-10 h-10 lg:w-24 lg:h-24" radius={35} fontSize="text-[8px] lg:text-lg" strokeWidth={6} />
                    <CircularGauge value={35.2} label="COOL" color="text-cyan-400" strokeColor="stroke-cyan-500" size="w-10 h-10 lg:w-24 lg:h-24" radius={35} fontSize="text-[8px] lg:text-lg" strokeWidth={6} />
                    <CircularGauge value={1.3} label="PUE" color="text-green-400" strokeColor="stroke-green-500" size="w-10 h-10 lg:w-24 lg:h-24" radius={35} fontSize="text-[8px] lg:text-lg" strokeWidth={6} />
                </div>
                <div className="mt-2 lg:mt-4 px-2 lg:px-4 space-y-2 lg:space-y-4">
                    <div>
                        <div className="flex justify-between text-[8px] lg:text-xs mb-0.5 lg:mb-1"><span className="text-slate-400">Energy</span><span className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">3468 kWh</span></div>
                        <div className="h-1 lg:h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[70%] shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[8px] lg:text-xs mb-0.5 lg:mb-1"><span className="text-slate-400">Power</span><span className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">0.21 kW</span></div>
                        <div className="h-1 lg:h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[30%] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div></div>
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

const UPSView = ({ data }) => {
    const isBatteryMode = data.upsState === 'Battery';
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
            <div className="grid grid-cols-2 gap-4 h-full">
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
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-slate-300"><Flame size={18} className={data.fireStatus === 'Alarm' ? 'text-red-500' : ''} /> FIRE</span><StatusBadge active={data.fireStatus === 'Alarm'} labelOn="ALARM" labelOff="NORMAL" type="alarm" /></div>
                    <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-slate-300"><Droplets size={18} className={data.leakageStatus === 'Alarm' ? 'text-blue-400' : ''} /> LEAK</span><StatusBadge active={data.leakageStatus === 'Alarm'} labelOn="ALARM" labelOff="NORMAL" type="alarm" /></div>
                </div>
            </Card>
        </div>
    </div>
);

const PDUView = ({ data }) => (
    <div className="grid grid-cols-2 gap-2 lg:gap-6 h-full content-start">
        {['pdu1', 'pdu2'].map((pduKey, idx) => (
            <Card key={pduKey} title={`PDU-${idx + 1} Status`}>
                <div className="space-y-2 lg:space-y-4">
                    <div className="flex items-center justify-center py-2 lg:py-6">
                        <div className={`w-14 h-14 lg:w-24 lg:h-24 rounded-full border-2 lg:border-4 ${idx === 0 ? 'border-cyan-500' : 'border-blue-500'} flex items-center justify-center bg-slate-900/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                            <Plug className={`w-6 h-6 lg:w-10 lg:h-10 ${idx === 0 ? "text-cyan-400" : "text-blue-400"}`} />
                        </div>
                    </div>
                    <div className="space-y-1 lg:space-y-2">
                        <ValueDisplay label="Voltage" value={data[pduKey].voltage} unit="V" icon={Zap} color={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                        <ValueDisplay label="Current" value={data[pduKey].current} unit="A" icon={Activity} color={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                        <ValueDisplay label="Frequency" value={data[pduKey].frequency} unit="Hz" icon={Activity} color="text-slate-400" />
                        <ValueDisplay label="Act Energy" value={data[pduKey].energy} unit="kWh" icon={Zap} color="text-green-400" />
                        <ValueDisplay label="PF" value={data[pduKey].powerFactor} unit="" icon={Activity} color="text-orange-400" />
                    </div>
                </div>
            </Card>
        ))}
    </div>
);

// --- RACK DESIGNER VIEW ---
const RackDesignerView = ({ rackItems, handleDrop, handleRemove, handleDragStart, assetLibrary, totalPower, totalWeight, totalU }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full content-start">
            <Card title="Available Assets" className="lg:col-span-3 h-full">
                <div className="space-y-3">
                    {assetLibrary.map(asset => (
                        <div
                            key={asset.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, asset)}
                            className={`p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition flex items-center justify-between group`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded flex items-center justify-center ${asset.color} text-white shadow-lg`}>
                                    <asset.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">{asset.name}</div>
                                    <div className="text-[10px] text-slate-400">{asset.u}U | {asset.power}kW | {asset.weight}kg</div>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-6 h-6 rounded bg-slate-600 flex items-center justify-center text-xs">+</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Server Rack 01 (42U)" className="lg:col-span-6 min-h-[800px] flex justify-center bg-slate-900">
                <div className="w-full max-w-md bg-black border-x-4 border-slate-700 relative p-1 shadow-2xl">
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
                            const onDrop = (e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-cyan-500/20'); handleDrop(uIndex); };
                            const isAnchor = item && item.type === 'anchor';

                            return (
                                <div
                                    key={uIndex}
                                    className={`h-[1.75rem] border-b border-slate-800 relative group transition-colors flex items-center justify-center text-[9px] text-slate-700 select-none ${!item ? 'hover:bg-slate-800' : ''}`}
                                    onDragOver={!item ? onDragOver : undefined}
                                    onDragLeave={!item ? onDragLeave : undefined}
                                    onDrop={!item ? onDrop : undefined}
                                    onContextMenu={(e) => { e.preventDefault(); handleRemove(uIndex); }}
                                >
                                    {!item && <span>Slot {uIndex + 1}</span>}
                                    {isAnchor && (
                                        <div
                                            className={`absolute top-0 left-0 right-0 z-10 m-[1px] rounded shadow-lg flex items-center px-4 gap-3 ${item.color} border-t border-white/20`}
                                            style={{ height: `calc(${item.u * 1.75}rem - 2px)` }}
                                        >
                                            <item.icon size={16} className="text-white/80" />
                                            <span className="font-bold text-white text-xs truncate">{item.name}</span>
                                            <div className="ml-auto text-[9px] text-white/50">{item.power}kW</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            <Card title="Rack Metrics" className="lg:col-span-3 h-full">
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
                        <div className="flex gap-2 mb-2"><Info size={14} className="text-cyan-400 shrink-0" /> <span>Tip: Drag assets from left library.</span></div>
                        <div className="flex gap-2"><ArrowDown size={14} className="text-red-400 shrink-0" /> <span>Right-click asset to remove.</span></div>
                    </div>
                </div>
            </Card>
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
    const { data: realtimeData, isConnected } = useRealtimeData({
        upsData: { inputVoltage: 0, outputVoltage: 0, upsState: 'Offline', batteryVoltage: 0, chargingCurrent: 0, dischargingCurrent: 0 },
        coolingData: { supplyTemp: 0, returnTemp: 0, compressorStatus: false, fanStatus: false, highRoomTemp: false },
        envData: { coldAisleTemp: 0, coldAisleHum: 0, hotAisleTemp: 0, hotAisleHum: 0, fireStatus: 'Normal', leakageStatus: 'Normal', frontDoorOpen: false, backDoorOpen: false, outdoorTemp: 18.2, history: [] },
        pduData: { pdu1: { voltage: 0, current: 0, frequency: 0, energy: 0, powerFactor: 0 }, pdu2: { voltage: 0, current: 0, frequency: 0, energy: 0, powerFactor: 0 } }
    });

    // Destructure for easier usage.
    if (!realtimeData) return <div className="p-10 text-red-500">Error: No Data Connection</div>;
    const { upsData, coolingData, envData, pduData } = realtimeData;

    // New Outdoor Temp State (Managed by Backend now, fallback for initial render)
    const outdoorTemp = envData?.outdoorTemp || 18.2;

    // --- MOCK STATE & SIMULATION LOOP REMOVED (Now handled by Backend) ---

    // Sim Actions
    // Note: These actions currently update LOCAL state which interacts poorly with the read-only hook stream.
    // For now, they will appear to "flicker" back to backend state after 1 sec.
    // Future Phase: Send commands to backend.
    const toggleFire = () => showToast("Fire Alarm Simulation: Please implement backend command.", "info");
    const toggleLeak = () => showToast("Leak Simulation: Please implement backend command.", "info");
    const toggleUPS = () => showToast("UPS Test: Please implement backend command.", "info");

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

    // --- RACK DESIGNER LOGIC ---
    const [rackItems, setRackItems] = useState(Array(42).fill(null));
    const [draggedAsset, setDraggedAsset] = useState(null);

    const assetLibrary = [
        { id: 'srv-1u', name: 'Server 1U', u: 1, power: 0.4, weight: 15, color: 'bg-blue-600', icon: Server },
        { id: 'srv-2u', name: 'Server 2U', u: 2, power: 0.8, weight: 28, color: 'bg-blue-700', icon: Server },
        { id: 'srv-4u', name: 'Blade Chassis 4U', u: 4, power: 2.5, weight: 80, color: 'bg-slate-700', icon: Server },
        { id: 'ups-2u', name: 'UPS 2U', u: 2, power: 0.1, weight: 35, color: 'bg-orange-600', icon: Battery },
        { id: 'sw-1u', name: 'Switch 1U', u: 1, power: 0.15, weight: 5, color: 'bg-cyan-600', icon: Activity },
    ];

    const handleDragStart = (e, asset) => {
        setDraggedAsset(asset);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = (index) => {
        if (!draggedAsset) return;

        // Check bounds (don't overflow top)
        if (index + 1 < draggedAsset.u) return;

        // Check collision
        let collision = false;
        for (let i = 0; i < draggedAsset.u; i++) {
            if (rackItems[index - i]) collision = true;
        }
        if (collision) {
            showToast("Not enough space!", "error");
            return;
        }

        const newRack = [...rackItems];
        for (let i = 0; i < draggedAsset.u; i++) {
            newRack[index - i] = { ...draggedAsset, type: i === 0 ? 'anchor' : 'filled', anchorId: index };
        }

        setRackItems(newRack);
        setDraggedAsset(null);
    };

    const handleRemove = (index) => {
        const item = rackItems[index];
        if (!item) return;

        const newRack = [...rackItems];
        const anchorIndex = item.type === 'anchor' ? index : item.anchorId;
        const anchorItem = newRack[anchorIndex];

        if (!anchorItem) return;

        for (let i = 0; i < anchorItem.u; i++) {
            newRack[anchorIndex - i] = null;
        }
        setRackItems(newRack);
    }

    const placedAssets = rackItems.filter(i => i && i.type === 'anchor');
    const totalPower = placedAssets.reduce((acc, curr) => acc + curr.power, 0).toFixed(2);
    const totalWeight = placedAssets.reduce((acc, curr) => acc + curr.weight, 0);
    const totalU = placedAssets.reduce((acc, curr) => acc + curr.u, 0);

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
                    {activeTab === 'home' && <HomeView coolingData={coolingData} upsData={upsData} envData={envData} />}
                    {activeTab === 'cooling' && <CoolingView data={coolingData} />}
                    {activeTab === 'ups' && <UPSView data={upsData} />}
                    {activeTab === 'pdu' && <PDUView data={pduData} />}
                    {activeTab === 'environment' && <EnvironmentView data={envData} />}
                    {activeTab === 'rack-designer' && <RackDesignerView
                        rackItems={rackItems}
                        handleDrop={handleDrop}
                        handleRemove={handleRemove}
                        handleDragStart={handleDragStart}
                        assetLibrary={assetLibrary}
                        totalPower={totalPower}
                        totalWeight={totalWeight}
                        totalU={totalU}
                    />}
                </div>

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
