import React, { useState, useEffect, useRef } from 'react';
import {
    Thermometer, Wind, Zap, Droplets, DoorOpen, AlertTriangle,
    Activity, Server, Fan, Battery, Plug, Flame, Settings,
    Clock, CheckCircle2, ArrowRight, Home, Menu, Download, Maximize, Minimize, ArrowUp, ArrowDown, Info, Check
} from 'lucide-react';

// --- COMPONENT LIBRARY ---

const Card = ({ title, children, className = "", alert = false }) => (
    <div className={`rounded-xl border backdrop-blur-md transition-all duration-300 ${alert
        ? 'bg-red-900/80 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
        : 'bg-slate-800/80 border-slate-700/50 shadow-lg'
        } ${className} flex flex-col`}>
        {title && (
            <h3 className={`text-sm font-medium uppercase tracking-wider px-4 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2 ${alert ? 'text-red-200' : 'text-slate-400'
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

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Copied: ${value}${unit ? unit : ''}`, type: 'success' } }));
    };

    return (
        <div onClick={handleCopy} className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700/30 mb-2 last:mb-0 cursor-pointer hover:bg-slate-800 transition-colors group">
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

const CircularGauge = ({ value, label, color = "text-cyan-400", strokeColor = "stroke-cyan-500", size = "w-24 h-24", radius = 35, fontSize = "text-lg" }) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${size} flex items-center justify-center`}>
                <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r={radius} className="fill-none stroke-slate-700/50 stroke-[8px]" />
                    <circle cx="50%" cy="50%" r={radius} className={`fill-none ${strokeColor} stroke-[8px] transition-all drop-shadow-[0_0_4px_currentColor]`} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                </svg>
                <span className={`absolute ${fontSize} font-bold font-mono drop-shadow-[0_0_5px_currentColor] ${color}`}>{value}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase mt-1">{label}</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-[auto_auto] gap-6 h-full pb-6">

        {/* 1. Alarm Status */}
        <Card title="Alarm Status" className="bg-slate-800/80">
            <div className="flex flex-row items-center justify-between h-full px-2">
                <div className="flex-1 space-y-1 mr-4">
                    <AlarmItem label="Notice" count={0} color="bg-blue-500" />
                    <AlarmItem label="General Alarm" count={1} color="bg-orange-500" />
                    <AlarmItem label="Critical Alarm" count={envData.fireStatus === 'Alarm' ? 1 : 0} color="bg-red-500" />
                </div>
                {/* Donut Chart Mockup */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="text-red-500 drop-shadow-[0_0_4px_currentColor]" strokeDasharray={`${envData.fireStatus === 'Alarm' ? 25 : 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="text-orange-500 drop-shadow-[0_0_4px_currentColor]" strokeDasharray="15, 100" strokeDashoffset="-25" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{envData.fireStatus === 'Alarm' ? 2 : 1}</span>
                    </div>
                </div>
            </div>
        </Card>

        {/* 2. UPS Mode */}
        <Card title="UPS Mode" className="bg-slate-800/80">
            <div className="flex flex-col items-center justify-center h-full gap-4 py-2">
                <div className="flex items-center gap-2 w-full px-4">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-slate-400">Input</div>
                        <div className="px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded min-w-[50px] text-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">{upsData.upsState === 'Mains' ? upsData.inputVoltage : 0}V</div>
                    </div>
                    <div className="flex-1 h-[2px] bg-slate-600 relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-slate-500 bg-slate-800 rounded flex items-center justify-center">
                            <Zap size={14} className="text-slate-400" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-slate-400">Output</div>
                        <div className="px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded min-w-[50px] text-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">{upsData.outputVoltage}V</div>
                    </div>
                </div>
                <div className="flex gap-4 mt-2">
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${upsData.upsState === 'Mains' ? 'bg-green-500 text-green-500' : 'bg-slate-700 text-slate-700'}`}></div>
                    <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${upsData.upsState === 'Battery' ? 'bg-orange-500 text-orange-500' : 'bg-slate-700 text-slate-700'}`}></div>
                </div>
            </div>
        </Card>

        {/* 3. Cooling Status */}
        <Card title="Cooling Status" className="bg-slate-800/80">
            <div className="space-y-3 px-2">
                {[
                    { label: 'Operation Status', value: coolingData.compressorStatus ? 'ON' : 'OFF', unit: '' },
                    { label: 'Control Mode', value: 'Return Air', unit: '' },
                    { label: 'Supply Air Temp', value: coolingData.supplyTemp, unit: '°C' },
                    { label: 'Return Air Temp', value: coolingData.returnTemp, unit: '°C' },
                    { label: 'Return Humidity', value: '45.0', unit: '%' },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{item.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="bg-cyan-500 text-white px-2 py-0.5 rounded text-xs font-bold min-w-[50px] text-center shadow-[0_0_8px_rgba(6,182,212,0.4)]">{item.value}</span>
                            <span className="text-slate-500 w-4">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {/* 4. Micro Environment Chart */}
        <Card title="MDC Environment" className="lg:col-span-2 bg-slate-800/80">
            <div className="flex items-center gap-4 mb-2 px-4">
                <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-2 text-cyan-400"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div> Temperature (°C)</span>
                    <span className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div> Humidity (%RH)</span>
                </div>
            </div>
            <div className="flex justify-around items-center h-56 w-full px-4 pb-6">
                <CircularGauge value={envData.coldAisleTemp} label="Avg Temp (°C)" color="text-cyan-400" strokeColor="stroke-cyan-500" size="w-40 h-40" radius={60} fontSize="text-3xl" />
                <CircularGauge value={envData.coldAisleHum} label="Avg Humidity (%)" color="text-green-400" strokeColor="stroke-green-500" size="w-40 h-40" radius={60} fontSize="text-3xl" />
                <CircularGauge value={85} label="Airflow (%)" color="text-blue-400" strokeColor="stroke-blue-500" size="w-40 h-40" radius={60} fontSize="text-3xl" />
            </div>
        </Card>

        {/* 5. Capacity / Load */}
        <Card className="bg-slate-800/80">
            <div className="flex flex-col h-full justify-between py-4">
                <div className="flex justify-around items-center">
                    <CircularGauge value={49.9} label="UPS Load" color="text-blue-400" strokeColor="stroke-blue-500" />
                    <CircularGauge value={35.2} label="Cooling Cap" color="text-cyan-400" strokeColor="stroke-cyan-500" />
                    <CircularGauge value={1.3} label="PUE" color="text-green-400" strokeColor="stroke-green-500" />
                </div>
                <div className="mt-4 px-4 space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Energy</span><span className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">3468.07 kWh</span></div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[70%] shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div></div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Total Power</span><span className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">0.21 kW</span></div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[30%] shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div></div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);

const CoolingView = ({ data }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full content-start">
        <div className="lg:col-span-8 grid grid-cols-1 gap-6">
            <Card title="Cooling Unit Schematic" className="min-h-[350px] relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8 py-6">
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-slate-400 text-sm">Return Air</span>
                        <div className="text-3xl font-mono font-bold text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]">{data.returnTemp}°C</div>
                        <Wind className={`text-slate-400 ${data.fanStatus ? 'animate-spin-slow' : ''}`} size={40} />
                    </div>
                    <ArrowRight className="text-cyan-500/50 hidden md:block" />
                    <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-slate-600 rounded-xl bg-slate-900/30">
                        <Activity className={`text-cyan-400 ${data.compressorStatus ? 'animate-pulse' : 'opacity-30'}`} size={32} />
                        <span className="text-xs text-slate-500 uppercase">Compressor</span>
                        <StatusBadge active={data.compressorStatus} />
                    </div>
                    <ArrowRight className="text-blue-300/50 hidden md:block" />
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
                            <div className="flex flex-col items-center gap-3 w-32 z-20">
                                <div className="w-16 h-16 rounded-lg bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg"><Plug className={isBatteryMode ? "text-slate-600" : "text-emerald-400 drop-shadow-[0_0_8px_currentColor]"} size={32} /></div>
                                <span className="text-sm font-bold text-slate-300 mt-2">MAINS</span>
                            </div>
                            <div className="flex-1 h-1 bg-slate-700 mx-2 mt-8 relative rounded-full">{!isBatteryMode && (<div className="absolute inset-0 bg-emerald-500/50 animate-progress-bar shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>)}</div>
                            <div className="flex flex-col items-center gap-2 w-40 z-20 -mt-4">
                                <div className={`w-32 h-32 rounded-xl border-2 ${isBatteryMode ? 'border-orange-500 bg-orange-900/10' : 'border-blue-500 bg-blue-900/10'} flex flex-col items-center justify-center bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                                    <Zap className={isBatteryMode ? "text-orange-500 animate-pulse" : "text-blue-400 drop-shadow-[0_0_8px_currentColor]"} size={40} />
                                    <span className="mt-2 text-xs font-mono text-slate-400">Mode: {data.upsState}</span>
                                </div>
                            </div>
                            <div className="flex-1 h-1 bg-slate-700 mx-2 mt-8 relative rounded-full"><div className={`absolute inset-0 ${isBatteryMode ? 'bg-orange-500/50' : 'bg-blue-500/50'} animate-progress-bar shadow-[0_0_10px_currentColor]`}></div></div>
                            <div className="flex flex-col items-center gap-3 w-32 z-20">
                                <div className="w-16 h-16 rounded-lg bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg"><Server className="text-cyan-400 drop-shadow-[0_0_8px_currentColor]" size={32} /></div>
                                <span className="text-sm font-bold text-slate-300 mt-2">LOAD</span>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center relative min-h-[60px]"><div className={`w-1 h-full ${isBatteryMode ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`}></div></div>
                        <div className="flex justify-center pb-4">
                            <div className="w-48 p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-4 shadow-lg z-20 relative">
                                <Battery className={isBatteryMode ? "text-orange-400" : "text-green-400 drop-shadow-[0_0_8px_currentColor]"} size={28} />
                                <div><div className="text-xs text-slate-400 uppercase">Battery Bank</div><div className="text-lg font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{data.batteryVoltage}V</div></div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full content-start">
        {['pdu1', 'pdu2'].map((pduKey, idx) => (
            <Card key={pduKey} title={`PDU-${idx + 1} Status`}>
                <div className="space-y-4">
                    <div className="flex items-center justify-center py-6">
                        <div className={`w-24 h-24 rounded-full border-4 ${idx === 0 ? 'border-cyan-500' : 'border-blue-500'} flex items-center justify-center bg-slate-900/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                            <Plug size={40} className={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <ValueDisplay label="Voltage" value={data[pduKey].voltage} unit="V" icon={Zap} color={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                        <ValueDisplay label="Current" value={data[pduKey].current} unit="A" icon={Activity} color={idx === 0 ? "text-cyan-400" : "text-blue-400"} />
                        <ValueDisplay label="Frequency" value={data[pduKey].frequency} unit="Hz" icon={Activity} color="text-slate-400" />
                        <ValueDisplay label="Active Energy" value={data[pduKey].energy} unit="kWh" icon={Zap} color="text-green-400" />
                        <ValueDisplay label="Power Factor" value={data[pduKey].powerFactor} unit="" icon={Activity} color="text-orange-400" />
                    </div>
                </div>
            </Card>
        ))}
    </div>
);

// --- MAIN APP ---

export default function DCIM_Preview() {
    const [activeTab, setActiveTab] = useState('home');
    const [showSim, setShowSim] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

    // Mock State
    const [coolingData, setCoolingData] = useState({ supplyTemp: 18.5, returnTemp: 24.2, compressorStatus: true, fanStatus: true, compressorRuntime: 1450, highRoomTemp: false });
    const [upsData, setUpsData] = useState({ inputVoltage: 230.5, outputVoltage: 230.0, upsState: 'Mains', batteryVoltage: 260.4, chargingCurrent: 2.1, dischargingCurrent: 0.0 });
    const [envData, setEnvData] = useState({
        coldAisleTemp: 22.4,
        coldAisleHum: 48,
        hotAisleTemp: 32.4,
        hotAisleHum: 30,
        fireStatus: 'Normal',
        leakageStatus: 'Normal',
        frontDoorOpen: false,
        backDoorOpen: false,
        history: Array(60).fill(0).map((_, i) => ({
            temp: 22 + Math.random() * 2,
            hum: 45 + Math.random() * 5
        }))
    });
    const [pduData, setPduData] = useState({
        pdu1: { voltage: 230.1, current: 12.5, frequency: 50.0, energy: 1450.2, powerFactor: 0.98 },
        pdu2: { voltage: 229.8, current: 11.8, frequency: 50.0, energy: 1320.5, powerFactor: 0.97 }
    });

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Real-time graph simulation (Random Walk)
    React.useEffect(() => {
        const interval = setInterval(() => {
            // Update Environment
            setEnvData(prev => {
                const last = prev.history[prev.history.length - 1];
                let newTemp = last.temp + (Math.random() - 0.5) * 0.4;
                if (newTemp > 25) newTemp -= 0.2;
                if (newTemp < 21) newTemp += 0.2;

                let newHum = last.hum + (Math.random() - 0.5) * 1.5;
                if (newHum > 55) newHum -= 0.8;
                if (newHum < 40) newHum += 0.8;

                const newHistory = [...prev.history.slice(1), { temp: newTemp, hum: newHum }];
                return {
                    ...prev,
                    coldAisleTemp: parseFloat(newTemp.toFixed(1)),
                    coldAisleHum: Math.round(newHum),
                    history: newHistory
                };
            });

            // Update PDU (Voltage/Current fluctuation)
            setPduData(prev => ({
                pdu1: { ...prev.pdu1, voltage: parseFloat((prev.pdu1.voltage + (Math.random() - 0.5) * 0.2).toFixed(1)), current: parseFloat((prev.pdu1.current + (Math.random() - 0.5) * 0.1).toFixed(1)) },
                pdu2: { ...prev.pdu2, voltage: parseFloat((prev.pdu2.voltage + (Math.random() - 0.5) * 0.2).toFixed(1)), current: parseFloat((prev.pdu2.current + (Math.random() - 0.5) * 0.1).toFixed(1)) }
            }));

            // Update UPS (Voltage fluctuation)
            setUpsData(prev => ({
                ...prev,
                inputVoltage: parseFloat((prev.inputVoltage + (Math.random() - 0.5) * 0.3).toFixed(1)),
                outputVoltage: parseFloat((prev.outputVoltage + (Math.random() - 0.5) * 0.1).toFixed(1))
            }));

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Sim Actions
    const toggleFire = () => setEnvData(p => ({ ...p, fireStatus: p.fireStatus === 'Normal' ? 'Alarm' : 'Normal' }));
    const toggleLeak = () => setEnvData(p => ({ ...p, leakageStatus: p.leakageStatus === 'Normal' ? 'Alarm' : 'Normal' }));
    const toggleUPS = () => setUpsData(p => ({ ...p, upsState: p.upsState === 'Mains' ? 'Battery' : 'Mains' }));

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

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case 'h':
                    setActiveTab('home');
                    showToast('Shortcut: Home View', 'info');
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 's':
                    setShowSim(prev => {
                        const newState = !prev;
                        showToast(`Simulator: ${newState ? 'ON' : 'OFF'}`, 'info');
                        return newState;
                    });
                    break;
                case 'e':
                    handleExport();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab, showSim, coolingData, upsData, envData, pduData]); // Dependencies for export and toggles

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans text-slate-200 overflow-hidden flex ${envData.fireStatus === 'Alarm' ? 'bg-red-950' : 'bg-[#0b1120]'}`}>

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64 border-r' : 'w-0 border-r-0'} transition-all duration-300 overflow-hidden z-20 flex flex-col backdrop-blur-md bg-slate-900/80 border-slate-800`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"><Server className="text-white" size={18} /></div>
                    <h1 className="text-xl font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">DCIM</h1>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {[{ id: 'home', label: 'Home', icon: Home }, { id: 'cooling', label: 'Cooling', icon: Fan }, { id: 'ups', label: 'UPS Power', icon: Zap }, { id: 'pdu', label: 'PDU', icon: Plug }, { id: 'environment', label: 'Environment', icon: Droplets }].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-cyan-900/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:bg-slate-800'}`}>
                            <item.icon size={20} className={activeTab === item.id ? "drop-shadow-[0_0_5px_currentColor]" : ""} />{item.label}
                        </button>
                    ))}
                </nav>

                {/* Time & Date Display */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-1">
                        <Clock size={16} className="text-cyan-500" />
                        <span className="text-xl font-mono font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider pl-7">
                        {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-cyan-400 transition-colors">
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg font-medium text-slate-200 uppercase tracking-widest">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleFullscreen} className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors" title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />} {isFullscreen ? 'Exit' : 'Full'}
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors" title="Export Data"><Download size={14} /> Export</button>
                        <button onClick={() => { setShowSim(!showSim); showToast(`Simulator: ${!showSim ? 'ON' : 'OFF'}`, 'info'); }} className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"><Settings size={14} /> Simulator</button>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${envData.fireStatus === 'Alarm' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
                            <span className="text-xs text-slate-400 uppercase font-bold">{envData.fireStatus === 'Alarm' ? 'CRITICAL ALARM' : 'SYSTEM NORMAL'}</span>
                        </div>
                    </div>
                </header>

                {showSim && (
                    <div className="absolute top-20 right-8 w-64 bg-slate-800/90 backdrop-blur-xl border border-slate-600 rounded-xl p-4 z-50 shadow-2xl">
                        <button onClick={toggleFire} className="w-full text-left px-3 py-2 rounded bg-red-500/20 text-red-200 text-xs border border-red-500/30 mb-2 hover:bg-red-500/30 transition-colors">Toggle Fire Alarm</button>
                        <button onClick={toggleUPS} className="w-full text-left px-3 py-2 rounded bg-orange-500/20 text-orange-200 text-xs border border-orange-500/30 mb-2 hover:bg-orange-500/30 transition-colors">Toggle UPS Battery</button>
                        <button onClick={toggleLeak} className="w-full text-left px-3 py-2 rounded bg-blue-500/20 text-blue-200 text-xs border border-blue-500/30 hover:bg-blue-500/30 transition-colors">Toggle Leak</button>
                    </div>
                )}

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'home' && <HomeView coolingData={coolingData} upsData={upsData} envData={envData} />}
                    {activeTab === 'cooling' && <CoolingView data={coolingData} />}
                    {activeTab === 'ups' && <UPSView data={upsData} />}
                    {activeTab === 'pdu' && <PDUView data={pduData} />}
                    {activeTab === 'environment' && <EnvironmentView data={envData} />}

                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                        <span>DCIM Dashboard v1.0.2</span>
                        <span>© 2025 Data Center Systems</span>
                    </div>
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
        @keyframes progress-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
        </div>
    );
}
