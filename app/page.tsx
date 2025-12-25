'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product-card'
import KakaoMap from '@/components/kakao-map'
import { Map, List, Search, Bell, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  const [items, setItems] = useState<any[]>([])
  const [mode, setMode] = useState<'map' | 'list'>('map')

  return (
    <main className="font-[Pretendard] pb-[80px]">
      {/* Header - Transparent & Floating feel */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100/50">
        <div className="px-5 py-3 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1 text-black">
            우리동네<span className="text-orange-500">떨이</span>
          </h1>
          <div className="flex gap-4 items-center">
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Search Bar Area */}
        <div className="px-5 pb-3">
          <div className="bg-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-gray-500">
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">지금 내 주변 50% 할인 상품은?</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative">
        {/* Toggle Mode Button (Floating) */}
        <div className="absolute top-4 right-5 z-10">
          <div className="bg-white/95 backdrop-blur shadow-[0_2px_10px_rgba(0,0,0,0.1)] rounded-full p-1 flex">
            <button
              onClick={() => setMode('map')}
              className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1",
                mode === 'map' ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100")}
            >
              <Map className="w-3.5 h-3.5" /> 지도
            </button>
            <button
              onClick={() => setMode('list')}
              className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1",
                mode === 'list' ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100")}
            >
              <List className="w-3.5 h-3.5" /> 목록
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className={cn("transition-opacity duration-300", mode === 'map' ? 'block opacity-100' : 'hidden opacity-0 h-0 overflow-hidden')}>
          <div className="h-[400px] w-full bg-gray-100">
            <KakaoMap onLoadItems={setItems} />
          </div>

          <div className="px-5 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
                <MapPin className="w-5 h-5 text-orange-500" />
                내 주변 마감세일
              </h3>
            </div>

            <div className="space-y-4">
              {items.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
              {items.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">🛒 지도에 보이는 상품이 없어요</p>
                  <p className="text-xs text-gray-300 mt-1">지도를 조금 이동해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className={cn("px-5 py-4 transition-opacity duration-300", mode === 'list' ? 'block opacity-100' : 'hidden opacity-0 h-0 overflow-hidden')}>
          <h3 className="font-bold text-lg mb-4 text-gray-900">🎁 오늘 놓치면 안되는 특가</h3>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {items.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
          {items.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <span className="text-4xl block mb-2">🤔</span>
              아직 발견된 상품이 없네요
            </div>
          )}
        </div>

        {/* Floating Seller Button */}
        <Link href="/sellers/products/new" className="fixed bottom-24 right-5 z-40 shadow-xl shadow-orange-500/20">
          <Button className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 border-0 flex items-center justify-center p-0">
            <span className="text-2xl">+</span>
          </Button>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 h-[80px] flex justify-between items-start z-50 max-w-[480px] mx-auto">
        <div className="flex flex-col items-center gap-1 w-12 cursor-pointer group">
          <Map className="w-6 h-6 text-orange-600 transition-transform group-active:scale-95" />
          <span className="text-[10px] font-bold text-gray-900">홈</span>
        </div>
        <div className="flex flex-col items-center gap-1 w-12 cursor-pointer group">
          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 transition-colors">💬</div>
          <span className="text-[10px] text-gray-400 font-medium">채팅</span>
        </div>
        <div className="flex flex-col items-center gap-1 w-12 cursor-pointer group">
          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-gray-400 font-medium">내정보</span>
        </div>
      </nav>
    </main>
  )
}
