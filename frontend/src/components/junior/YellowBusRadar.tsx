'use client';

import React, { useState } from 'react';
import {
  Bus,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
  Compass,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Volume2,
  X
} from 'lucide-react';
import { JuniorBusRadar } from '@/lib/types';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';

interface YellowBusRadarProps {
  busData: JuniorBusRadar;
}

export function YellowBusRadar({ busData }: YellowBusRadarProps) {
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');

  const handleStartCall = () => {
    playButtonClick();
    setCallStatus('ringing');
    setCallModalOpen(true);

    setTimeout(() => {
      setCallStatus('connected');
    }, 1800);
  };

  const stops = [
    { name: 'School Main Campus', time: '03:15 PM', status: 'Departed' },
    { name: 'Sarjapur Signal Junction', time: '03:26 PM', status: 'Passed' },
    { name: 'Bellandur EcoSpace Gate 2', time: '03:38 PM', status: 'Current Stop' },
    { name: "Sector 15 Crossroad (Aarav's Stop)", time: '03:46 PM', status: 'Approaching (ETA 3 mins)' },
    { name: 'Greenwood Palms Apartments', time: '03:55 PM', status: 'Terminal Stop' }
  ];

  return (
    <section className="rounded-3xl border-4 border-yellow-400 bg-white p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* ========================================================
          HEADER & FLOATING RADAR PILL
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-yellow-100">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-900 px-3.5 py-1 text-xs font-black mb-1 border border-yellow-300">
            <Bus className="h-4 w-4 text-yellow-700" />
            <span>Cartoon Telemetry Radar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Junior School Bus Radar 🚌✨
          </h2>
          <p className="text-xs font-bold text-slate-500">
            Watch your bus roll through the neighborhood in real time!
          </p>
        </div>

        {/* Floating Radar Pill */}
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-yellow-500 p-3 px-5 shadow-lg border-b-4 animate-bounce-short">
          <span className="flex h-3 w-3 rounded-full bg-emerald-600 animate-ping" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-amber-950 tracking-wider">Live ETA Alert</p>
            <p className="text-sm font-black text-slate-950">
              {busData.route_no}: {busData.stops_away} Stops Away • {busData.eta_mins} Mins ETA!
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          ILLUSTRATED CARTOON NEIGHBORHOOD MAP
      ======================================================== */}
      <div className="relative h-80 sm:h-96 w-full rounded-3xl bg-[#E0F2FE] border-4 border-sky-300 overflow-hidden shadow-inner select-none">
        
        {/* Background Grid & Hills */}
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        {/* Cartoon Park / Green Pastures */}
        <div className="absolute top-8 left-8 h-28 w-44 rounded-3xl bg-emerald-200/80 border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-sm">
          🌳 🏡 🌳
        </div>

        <div className="absolute bottom-6 right-10 h-32 w-52 rounded-3xl bg-emerald-200/80 border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-sm">
          🏡 🌸 🏫
        </div>

        {/* Cartoon School Building at Start */}
        <div className="absolute top-6 right-8 flex flex-col items-center">
          <span className="text-4xl drop-shadow-md">🏫</span>
          <span className="rounded-lg bg-white px-2 py-0.5 text-[9px] font-black text-slate-700 shadow-sm border border-slate-200">
            School Gate
          </span>
        </div>

        {/* Aarav's Home Destination */}
        <div className="absolute bottom-6 left-12 flex flex-col items-center animate-bounce-short">
          <span className="text-4xl drop-shadow-md">🏡</span>
          <span className="rounded-lg bg-pink-500 text-white px-2.5 py-0.5 text-[10px] font-black shadow-md border border-white">
            Aarav's Stop ⭐
          </span>
        </div>

        {/* Winding Asphalt Cartoon Road */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
          <path
            d="M 720 50 Q 500 80 400 180 T 100 340"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="32"
            strokeLinecap="round"
          />
          {/* Dashed White Center Line */}
          <path
            d="M 720 50 Q 500 80 400 180 T 100 340"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeDasharray="16 14"
            strokeLinecap="round"
          />
        </svg>

        {/* Animated Moving Cartoon Yellow Bus */}
        <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000">
          
          {/* Speech Bubble above Bus */}
          <div className="mb-1 rounded-xl bg-white px-3 py-1 text-[10px] font-black text-slate-900 shadow-md border-2 border-amber-400 whitespace-nowrap animate-bounce">
            Uncle Ramesh is driving smoothly! 🚌💨
          </div>

          {/* Yellow Bus Body Graphic */}
          <div className="relative flex items-center justify-center h-16 w-28 rounded-2xl bg-amber-400 border-4 border-amber-600 shadow-2xl">
            {/* Windows */}
            <div className="flex gap-1.5 px-2">
              <div className="h-6 w-5 rounded-md bg-sky-200 border border-sky-400" />
              <div className="h-6 w-5 rounded-md bg-sky-200 border border-sky-400" />
              <div className="h-6 w-5 rounded-md bg-sky-200 border border-sky-400 flex items-center justify-center text-[10px]">
                👨‍✈️
              </div>
            </div>
            
            {/* Bus Number Pill */}
            <span className="absolute -bottom-2 font-black text-[9px] bg-slate-900 text-yellow-300 px-1.5 rounded">
              BUS 4
            </span>
          </div>

          {/* Wheels */}
          <div className="flex justify-between w-20 -mt-1 px-1">
            <div className="h-4 w-4 rounded-full bg-slate-900 border-2 border-white animate-spin" />
            <div className="h-4 w-4 rounded-full bg-slate-900 border-2 border-white animate-spin" />
          </div>

        </div>

      </div>

      {/* ========================================================
          BOTTOM: DRIVER CARD & ROUTE PROGRESS
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Uncle Ramesh Driver Card */}
        <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-yellow-50 to-amber-50 border-4 border-yellow-300 p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 p-1 border-2 border-white shadow-md">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
                alt="Uncle Ramesh"
                className="h-full w-full rounded-xl object-cover"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white font-bold border-2 border-white">
                ✓
              </span>
            </div>

            <div>
              <span className="rounded-md bg-yellow-200 text-yellow-900 px-2 py-0.5 text-[10px] font-black uppercase">
                Verified School Driver
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">{busData.driver_name}</h4>
              <p className="text-xs font-bold text-slate-500">Route #4 • {busData.vehicle_no}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-yellow-200">
            <button
              onClick={handleStartCall}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3.5 px-4 shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              <Phone className="h-4 w-4" />
              <span>📞 Quick Call Uncle Ramesh</span>
            </button>
          </div>
        </div>

        {/* Route Stops Checklist */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-50 border-4 border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h4 className="text-sm font-black text-slate-800">Route #4 Stops Sequence</h4>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> GPS Active & Speed Governed (38 km/h)
            </span>
          </div>

          <div className="space-y-2">
            {stops.map((stop, idx) => {
              const isCurrent = stop.status === 'Current Stop';
              const isAaravStop = stop.name.includes("Aarav's Stop");
              const isPast = stop.status === 'Departed' || stop.status === 'Passed';

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    isCurrent
                      ? 'border-yellow-400 bg-yellow-100 text-yellow-950 font-black shadow-sm'
                      : isAaravStop
                      ? 'border-pink-300 bg-pink-50 text-pink-900 font-black ring-2 ring-pink-300'
                      : isPast
                      ? 'border-slate-200 bg-white/60 text-slate-400 line-through'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-black border border-slate-300">
                      {idx + 1}
                    </span>
                    <span>{stop.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px]">{stop.time}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                      isCurrent ? 'bg-amber-400 text-slate-900 animate-pulse' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {stop.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>


      {/* ========================================================
          SIMULATED QUICK CALL DIALOG
      ======================================================== */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-emerald-400 bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-4xl shadow-md">
              👨‍✈️
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[10px] font-black uppercase">
                {callStatus === 'ringing' ? 'Connecting to Bus Phone...' : 'Connected Audio'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Uncle Ramesh</h3>
              <p className="text-xs font-bold text-slate-500">{busData.driver_phone}</p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-900 text-left">
              {callStatus === 'ringing' ? (
                <p className="text-center font-mono animate-pulse">Ringing... 📞</p>
              ) : (
                <p>
                  "Namaste Aarav beta! We just crossed Bellandur signal. I will be at Sector 15 Crossroad in about 3 minutes. Keep your school bag ready! 🚌"
                </p>
              )}
            </div>

            <button
              onClick={() => {
                playButtonClick();
                setCallModalOpen(false);
              }}
              className="w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white py-3 font-black text-xs shadow-md border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
            >
              End Call 🔴
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
