import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Product {
    id: string
    name: string
    store_name: string
    original_price: number
    discount_price: number
    image_url: string
    expires_at: string
    golden_time_opt_in: boolean
    ai_tags: string[] | null
    ai_generated_copy: string | null
    lat?: number
    lng?: number
    is_sold_out?: boolean
}

export function ProductCard({ product }: { product: Product }) {
    // Check if Golden Time is active (30 mins before expiry)
    // Logic: In real app, sync with server time. Here simple check.
    const expiry = new Date(product.expires_at)
    const now = new Date()
    const diffMinutes = (expiry.getTime() - now.getTime()) / (1000 * 60)
    const isGoldenTime = product.golden_time_opt_in && diffMinutes <= 30 && diffMinutes > 0

    // Calculate final price logic can be complex, assuming discount_price IS the price
    // But if golden time, maybe we show extra badge. 
    // For MVP, just showing badge is enough.

    const discountRate = Math.round(((product.original_price - product.discount_price) / product.original_price) * 100)

    return (
        <Link href={`/products/${product.id}`}>
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                <div className="relative aspect-[4/3]">
                    <img
                        src={product.image_url || 'https://placehold.co/400x300'}
                        alt={product.name}
                        className={cn("w-full h-full object-cover", product.is_sold_out ? "grayscale" : "")}
                    />
                    {isGoldenTime && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            골든타임 특가
                        </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(product.expires_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 마감
                    </div>
                </div>
                <CardContent className="p-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{product.name}</h3>
                        <span className="text-orange-600 font-bold text-lg">{discountRate}%</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {product.store_name}
                    </p>

                    {product.ai_generated_copy ? (
                        <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2 line-clamp-1">
                            ✨ {product.ai_generated_copy}
                        </p>
                    ) : null}

                    <div className="flex gap-1 flex-wrap">
                        {product.ai_tags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5 font-normal text-gray-500">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-end">
                    <div>
                        <span className="text-xs text-gray-400 line-through mr-1">{product.original_price.toLocaleString()}원</span>
                        <span className="font-bold text-lg">{product.discount_price.toLocaleString()}원</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
