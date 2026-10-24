'use client';

import React, { useState, useRef } from 'react';
import {
  Palette,
  Sparkles,
  Camera,
  Upload,
  Heart,
  Award,
  Music,
  Share2,
  X,
  CheckCircle2,
  Download,
  Filter,
  Smile,
  Volume2
} from 'lucide-react';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface CreativeItem {
  id: string;
  title: string;
  category: 'art' | 'craft' | 'audio' | 'science';
  mediaUrl: string;
  thumbnailBg: string;
  date: string;
  caption: string;
  teacherName: string;
  teacherSticker: string;
  starsAwarded: number;
  likes: number;
}

export function CreativeCorner() {
  const [items, setItems] = useState<CreativeItem[]>([
    {
      id: 'cr-1',
      title: 'Rainbow Butterfly Origami',
      category: 'craft',
      mediaUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
      thumbnailBg: 'from-pink-100 to-amber-100 dark:from-pink-950/40 dark:to-amber-950/40',
      date: 'Yesterday',
      caption: 'Folded 4 wings using pastel paper and glitter pens for the antennae!',
      teacherName: 'Ms. Priya',
      teacherSticker: '🌟 Master Crafter',
      starsAwarded: 25,
      likes: 8
    },
    {
      id: 'cr-2',
      title: 'Our Solar System Watercolour',
      category: 'art',
      mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
      thumbnailBg: 'from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40',
      date: '3 days ago',
      caption: 'Painted Saturn with giant rings and Earth with blue swirling clouds.',
      teacherName: 'Mrs. Ananya Verma',
      teacherSticker: '🚀 Cosmic Explorer',
      starsAwarded: 30,
      likes: 12
    },
    {
      id: 'cr-3',
      title: 'Recycled Plastic Bottle Planter',
      category: 'science',
      mediaUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
      thumbnailBg: 'from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40',
      date: '5 days ago',
      caption: 'Planted fenugreek seeds in a cut bottle with soil and water sprinkler.',
      teacherName: 'Mr. Rakesh (EVS)',
      teacherSticker: '🌱 Eco Champion',
      starsAwarded: 20,
      likes: 6
    },
    {
      id: 'cr-4',
      title: 'The Friendly Dragon Story Drawing',
      category: 'art',
      mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      thumbnailBg: 'from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40',
      date: 'Last week',
      caption: 'My dragon breathes bubbles instead of fire to give free car washes!',
      teacherName: 'Ms. Priya',
      teacherSticker: '🎨 Wild Imagination',
      starsAwarded: 25,
      likes: 15
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'art' | 'craft' | 'science'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'art' | 'craft' | 'science'>('art');
  const [newCaption, setNewCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = items.filter((item) => (filter === 'all' ? true : item.category === filter));

  const handleLike = (id: string) => {
    playStarCollect();
    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#EC4899', '#FBBF24']
      });
    } catch {}

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item))
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsUploading(true);
    playButtonClick();

    setTimeout(() => {
      const newItem: CreativeItem = {
        id: `cr-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        mediaUrl: previewUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        thumbnailBg: 'from-amber-100 to-pink-100 dark:from-amber-950/40 dark:to-pink-950/40',
        date: 'Just now',
        caption: newCaption || 'Shared my wonderful creation with teacher and classmates!',
        teacherName: 'Waiting for Review',
        teacherSticker: '⭐ New Showcase',
        starsAwarded: 20,
        likes: 1
      };

      setItems([newItem, ...items]);
      setIsUploading(false);
      setIsModalOpen(false);
      setNewTitle('');
      setNewCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);

      playStarCollect();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899']
        });
      } catch {}

      setToastMessage('🎉 Awesome! Your creation is uploaded to the Wonder Wall (+20 Stars)');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 shadow-xl text-xs font-black animate-bounce">
          <Sparkles className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-pink-950/40 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-black">
            <Palette className="h-3.5 w-3.5" />
            <span>My Creative Wonder Wall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Art, Crafts &amp; Fun Activities 🎨
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-medium">
            Take a photo of your drawings, origami, and DIY science creations. Earn special teacher stickers and shine like a star!
          </p>
        </div>

        <button
          onClick={() => {
            playButtonClick();
            setIsModalOpen(true);
          }}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Camera className="h-4 w-4" />
          <span>+ Share My Creation</span>
        </button>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: '🌟 All Creations' },
            { id: 'art', label: '🎨 Drawings & Paint' },
            { id: 'craft', label: '✂️ Origami & Crafts' },
            { id: 'science', label: '🌱 Science & Nature' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                playButtonClick();
                setFilter(pill.id as any);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === pill.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Total Creations Count */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>{filteredItems.length} Wonder Pieces Displayed</span>
        </div>
      </div>

      {/* Creations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            {/* Image Preview Container */}
            <div className={`relative h-48 w-full bg-gradient-to-tr ${item.thumbnailBg} overflow-hidden`}>
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Category Tag */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                  {item.category === 'art' ? '🎨 Art' : item.category === 'craft' ? '✂️ Craft' : '🌱 Science'}
                </span>
              </div>

              {/* Stars Tag */}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-amber-950 shadow-sm">
                <Sparkles className="h-3 w-3 fill-amber-950" />
                <span>+{item.starsAwarded} Stars</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>{item.date}</span>
                  <span className="text-slate-500">{item.teacherName}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {item.caption}
                </p>
              </div>

              {/* Teacher Sticker & Heart Reaction */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-800/60 text-pink-700 dark:text-pink-300 text-xs font-black truncate">
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.teacherSticker}</span>
                </div>

                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer group/btn shrink-0"
                  title="Cheer with Love!"
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 group-hover/btn:scale-125 transition-transform" />
                  <span>{item.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Add to Wonder Wall
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Creation Title 🌟
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Magic Dragon Drawing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'art', label: '🎨 Art & Paint' },
                    { id: 'craft', label: '✂️ Origami/Craft' },
                    { id: 'science', label: '🌱 Science DIY' }
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newCategory === cat.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Photo of your Creation 📸
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 p-5 text-center transition-all group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-28 mx-auto object-cover rounded-xl shadow-md"
                      />
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        Photo Ready! Click to replace.
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform mb-1" />
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Take Photo or Select Image
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tell Teacher About It! (Caption) 💬
                </label>
                <textarea
                  rows={2}
                  placeholder="How did you make this? What colors did you use?"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Publishing...' : '🌟 Post to Wonder Wall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
