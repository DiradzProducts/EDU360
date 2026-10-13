'use client';

import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  ShieldCheck, 
  Clock, 
  Radio, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { BusRoute } from '@/lib/types';

interface BusTrackerProps {
  bus: BusRoute;
  onAdvanceStop: () => Promise<void>;
}

export function BusTracker({ bus, onAdvanceStop }: BusTrackerProps) {
  const [advancing, setAdvancing] = useState(false);
  const [callingDriver, setCallingDriver] = useState(false);

  let stops: { name: string; time: string; status: string }[] = [];
  try {
    stops = JSON.parse(bus.stops_json);
  } catch (e) {
    stops = [
      { name: "School Main Campus", time: "03:15 PM", status: "Departed" },
      { name: "Sarjapur Signal Junction", time: "03:26 PM", status: "Passed" },
      { name: "Bellandur EcoSpace Gate 2", time: "03:38 PM", status: "Current Stop" },
      { name: "Sector 15 Crossroad (Aarav's Stop)", time: "03:46 PM", status: "Approaching" },
      { name: "Greenwood Palms Apartments", time: "03:55 PM", status: "Terminal Stop" }
    ];
  }

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      await onAdvanceStop();
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md">
      {/* Top Banner / GPS Telemetry Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 shadow-inner">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{bus.route_number} • Bus #{bus.vehicle_no}</h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  GPS Live Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{bus.live_status}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/15 text-right">
              <span className="text-[10px] text-slate-300 block">ETA to Aarav's Stop</span>
              <span className="text-lg font-black text-amber-300 tabular-nums">{bus.eta_mins} mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Simulator */}
      <div className="relative bg-slate-100 p-6 border-b border-slate-200">
        <div className="relative h-44 w-full rounded-xl bg-slate-200/90 border border-slate-300/80 overflow-hidden shadow-inner flex flex-col justify-center px-6">
          {/* Stylized simulated road */}
          <div className="absolute left-6 right-6 h-3 bg-slate-400 rounded-full top-1/2 -translate-y-1/2" />
          <div className="absolute left-6 right-6 border-b-2 border-dashed border-white top-1/2 -translate-y-1/2" />

          {/* Stops along the road */}
          <div className="relative flex justify-between items-center z-10">
            {stops.map((stop, idx) => {
              const isPassed = idx < bus.current_stop_idx;
              const isCurrent = idx === bus.current_stop_idx;
              const isTargetChild = stop.name.includes("Aarav's Stop");

              return (
                <div key={idx} className="flex flex-col items-center group">
                  {/* Pin Circle */}
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-300 shadow-lg scale-110' 
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : isTargetChild
                      ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                      : 'bg-white text-slate-500 border-2 border-slate-300'
                  }`}>
                    {isCurrent ? (
                      <Bus className="h-4 w-4" />
                    ) : isPassed ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : isTargetChild ? (
                      <MapPin className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}

                    {/* Animated bus marker overlay */}
                    {isCurrent && (
                      <div className="absolute -top-7 rounded-full bg-slate-900 text-white px-2 py-0.5 text-[9px] font-bold whitespace-nowrap shadow-md animate-bounce">
                        Current Location
                      </div>
                    )}
                  </div>

                  {/* Stop label */}
                  <div className="mt-2 text-center max-w-[85px]">
                    <span className={`text-[11px] font-bold block truncate ${
                      isTargetChild ? 'text-amber-700' : isCurrent ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {stop.name.split('(')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500">{stop.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator control button */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            Simulating live telemetry stream every 10 seconds
          </span>

          <button
            type="button"
            onClick={handleAdvance}
            disabled={advancing}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${advancing ? 'animate-spin' : ''}`} />
            <span>Simulate Next Bus Stop</span>
          </button>
        </div>
      </div>

      {/* Driver Contact & Stop Timeline Details */}
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
            RK
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">{bus.driver_name} (Senior Driver)</span>
            <span className="text-[11px] text-slate-500">Contact: {bus.driver_phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {callingDriver ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <PhoneCall className="h-3.5 w-3.5 animate-bounce" />
              <span>Calling Ramesh Kumar...</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setCallingDriver(true);
                setTimeout(() => setCallingDriver(false), 3000);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
              <span>Call Driver</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
