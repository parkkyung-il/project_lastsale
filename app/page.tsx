'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ProductCard } from '@/components/product-card'
import KakaoMap from '@/components/kakao-map'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Map, List, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [items, setItems] = useState<any[]>([])
  const [mode, setMode] = useState<'map' | 'list'>('map')

  return (
    <main className="min-h-screen bg-white pb-20 font-[Pretendard]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
          우리동네 떨이
        </h1>
        <div className="flex gap-2">
          <Link href="/sellers/products/new">
            <Button variant="ghost" size="sm" className="text-sm font-medium">사장님 입장</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-500" />
            내 주변 득템 지도
          </h2>
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setMode('map')}
              className={`p-2 rounded-md text-sm font-bold transition-all ${mode === 'map' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('list')}
              className={`p-2 rounded-md text-sm font-bold transition-all ${mode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className={mode === 'map' ? 'block' : 'hidden'}>
          <KakaoMap onLoadItems={setItems} />
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2 font-medium">✨ 지도 영역 내 목록 ({items.length}개)</p>
            <div className="space-y-3">
              {items.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
              {items.length === 0 && (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
                  지도 안에 상품이 없어요 🥲<br />
                  지도를 축소하거나 이동해보세요!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List Section (Only) */}
        <div className={mode === 'list' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
          {items.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              지도에서 먼저 상품을 탐색해주세요!
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <div className="flex flex-col items-center gap-1 text-orange-600">
          <Map className="w-6 h-6" />
          <span className="text-[10px] font-bold">홈</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-300">
          <div className="w-6 h-6 rounded-full border border-gray-300" />
          <span className="text-[10px]">채팅</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-300">
          <div className="w-6 h-6 rounded-full border border-gray-300" />
          <span className="text-[10px]">내정보</span>
        </div>
      </nav>
    </main>
  )
}
