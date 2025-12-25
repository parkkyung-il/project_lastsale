'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

declare global {
    interface Window {
        kakao: any
    }
}

interface MapProps {
    onLoadItems: (items: any[]) => void
}

export default function KakaoMap({ onLoadItems }: MapProps) {
    const mapRef = useRef<any>(null)
    const [loading, setLoading] = useState(false)

    // Initialize Map
    const initMap = () => {
        if (!window.kakao || !window.kakao.maps) return

        const container = document.getElementById('map')
        if (!container) return

        // Default: Gangnam (or User Location if implementable)
        const options = {
            center: new window.kakao.maps.LatLng(37.498095, 127.027610),
            level: 4
        }

        const map = new window.kakao.maps.Map(container, options)
        mapRef.current = map

        // Register Idle Event (Fired after move/zoom ends)
        window.kakao.maps.event.addListener(map, 'idle', () => {
            fetchProductsInView(map)
        })

        // Initial Fetch
        fetchProductsInView(map)
    }

    const fetchProductsInView = async (map: any) => {
        setLoading(true)
        const bounds = map.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()

        const supabase = createClient()
        const { data, error } = await supabase.rpc('get_products_in_view', {
            min_lat: sw.getLat(),
            min_lng: sw.getLng(),
            max_lat: ne.getLat(),
            max_lng: ne.getLng()
        })

        setLoading(false)

        if (error) {
            console.error(error)
            toast.error('상품 불러오기 실패')
        } else {
            onLoadItems(data || [])
            drawMarkers(map, data || [])
        }
    }

    const markersRef = useRef<any[]>([])

    const drawMarkers = (map: any, products: any[]) => {
        // Clear existing
        markersRef.current.forEach(m => m.setMap(null))
        markersRef.current = []

        products.forEach(p => {
            const markerPosition = new window.kakao.maps.LatLng(p.lat, p.lng)
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                clickable: true
            })

            // Simple InfoWindow or navigate on click
            // For MVP, just tooltip logic
            const iwContent = `<div style="padding:5px;font-size:12px;">${p.name}<br/><b>${p.discount_price}원</b></div>`
            const infowindow = new window.kakao.maps.InfoWindow({
                content: iwContent
            })

            window.kakao.maps.event.addListener(marker, 'mouseover', () => {
                infowindow.open(map, marker)
            })
            window.kakao.maps.event.addListener(marker, 'mouseout', () => {
                infowindow.close()
            })

            marker.setMap(map)
            markersRef.current.push(marker)
        })
    }

    return (
        <div className="relative w-full h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-inner">
            <Script
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
                strategy="afterInteractive"
                onLoad={() => {
                    window.kakao.maps.load(() => {
                        initMap()
                    })
                }}
            />
            <div id="map" className="w-full h-full"></div>

            {loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    주변 떨이 찾는 중...
                </div>
            )}

            <Button
                size="icon"
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-black shadow-lg rounded-full w-10 h-10"
                onClick={() => mapRef.current && fetchProductsInView(mapRef.current)}
            >
                <RefreshCcw className="w-4 h-4" />
            </Button>
        </div>
    )
}
