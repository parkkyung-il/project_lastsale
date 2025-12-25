'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, MapPin, Clock, Share2, Heart, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [reserving, setReserving] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        async function fetchProduct() {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          stores (
            name,
            address,
            geo_location
          )
        `)
                .eq('id', id)
                .single()

            if (error) {
                toast.error('상품을 불러오지 못했습니다.')
                router.push('/')
            } else {
                setProduct(data)
            }
            setLoading(false)
        }
        fetchProduct()
    }, [id, router, supabase])

    const handleReserve = async () => {
        setReserving(true)

        // 1. Check Auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error('로그인이 필요합니다.')
            router.push('/login')
            return
        }

        // 2. Transact: Reserve Item
        // Note: 'reserve_item' function we created in SQL
        const { data: result, error } = await supabase.rpc('reserve_item', {
            p_id: id,
            b_id: user.id
        })

        if (error || !result.success) {
            toast.error(result?.message || '예약에 실패했습니다. (이미 팔렸을 수도 있어요!)')
            setReserving(false)
            return
        }

        // 3. Create Chat Room
        // Check if room exists first? Or just try insert.
        // We strictly need seller_id. 
        const { data: store } = await supabase.from('stores').select('owner_id').eq('id', product.store_id).single()

        // Upsert Chat Room
        const { data: room, error: chatError } = await supabase
            .from('chat_rooms')
            .select()
            .eq('product_id', id)
            .eq('buyer_id', user.id)
            .single()

        let roomId = room?.id

        if (!room) {
            const { data: newRoom } = await supabase
                .from('chat_rooms')
                .insert({
                    product_id: id,
                    buyer_id: user.id,
                    seller_id: store?.owner_id
                })
                .select()
                .single()
            roomId = newRoom?.id
        }

        setReserving(false)
        toast.success('예약 성공! 채팅방으로 이동합니다.')
        router.push(`/chat/${roomId}`)
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
    if (!product) return null

    // Golden Time Logic (Simple Frontend Check)
    const expiry = new Date(product.expires_at)
    const now = new Date()
    const diffMinutes = (expiry.getTime() - now.getTime()) / (1000 * 60)
    const isGoldenTime = product.golden_time_opt_in && diffMinutes <= 30 && diffMinutes > 0

    return (
        <div className="min-h-screen bg-white pb-24 font-[Pretendard]">
            {/* Header Image */}
            <div className="relative h-[40vh] w-full bg-gray-100">
                <img
                    src={product.image_url || 'https://placehold.co/600x400'}
                    className={`w-full h-full object-cover ${product.is_sold_out ? 'grayscale' : ''}`}
                    alt={product.name}
                />
                <Link href="/" className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm">
                        <Share2 className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm">
                        <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {isGoldenTime && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white px-4 py-2 flex justify-between items-center animate-pulse">
                        <span className="font-bold flex items-center gap-1">⚡ 골든타임 특가 진행 중!</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">곧 마감</span>
                    </div>
                )}
            </div>

            <div className="p-5 -mt-6 bg-white rounded-t-3xl relative z-10 space-y-6">
                {/* Title & Price */}
                <div>
                    <div className="flex gap-2 mb-2">
                        {product.ai_tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-gray-400 line-through text-sm mr-1">{product.original_price.toLocaleString()}원</span>
                            <span className="text-2xl font-bold text-orange-600">{product.discount_price.toLocaleString()}원</span>
                        </div>
                        {product.is_sold_out ? (
                            <Badge variant="destructive" className="text-lg px-3 py-1">품절</Badge>
                        ) : (
                            <div className="text-sm font-medium text-gray-500 flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                <Clock className="w-4 h-4" />
                                {new Date(product.expires_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 마감
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Analysis Card */}
                {product.ai_generated_copy && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                        <p className="text-sm text-indigo-900 font-bold mb-1">✨ AI가 분석한 맛 포인트</p>
                        <p className="text-lg font-bold text-indigo-700 mb-2">"{product.ai_generated_copy}"</p>
                        <div className="bg-white/60 p-2 rounded-lg">
                            <span className="text-xs text-indigo-500 font-bold block mb-0.5">추천 상황</span>
                            <p className="text-sm text-indigo-800">{product.web_search_summary || product.ai_tags?.join(', ')}</p>
                        </div>
                    </div>
                )}

                {/* Store Info */}
                <div className="border-t border-b border-gray-100 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">🏠</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{product.stores.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {product.stores.address || '주소 정보 없음'}
                        </p>
                    </div>
                    <Button variant="outline" size="sm">상점 보기</Button>
                </div>

                {/* Description */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-2">상품 정보</h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {product.description || '사장님이 상세 설명을 입력하지 않았습니다.\n(하지만 AI 분석을 믿어보세요!)'}
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 safe-area-pb">
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl">
                    <Heart className="w-6 h-6 text-gray-400" />
                </Button>
                <Button
                    className="flex-1 h-14 rounded-xl text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
                    onClick={handleReserve}
                    disabled={product.is_sold_out || reserving}
                >
                    {reserving ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : product.is_sold_out ? (
                        '품절된 상품입니다'
                    ) : (
                        <span className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            채팅으로 구매 예약하기
                        </span>
                    )}
                </Button>
            </div>
        </div>
    )
}
