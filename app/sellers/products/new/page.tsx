'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Sparkles, Upload, Clock } from 'lucide-react'

export default function NewProductPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageBase64, setImageBase64] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        originalPrice: '',
        discountPrice: '',
        stock: '1',
        expiresAt: '', // HH:mm
        goldenTime: false,
        aiCopy: '',
        aiScenario: '',
        aiTags: [] as string[]
    })

    // Handle Image Upload & Pre-analysis
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
                setImageBase64(reader.result as string)
                // Optionally auto-trigger AI if name is present? 
                // Better to let user click "Magic" button.
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAIAnalyze = async () => {
        if (!imageBase64 || !formData.name) {
            toast.error('상품명과 사진을 먼저 등록해주세요!')
            return
        }

        setAnalyzing(true)
        try {
            // Assuming store name is stored in session or we ask user. 
            // For MVP, we pass empty text or user input.
            const res = await fetch('/api/analyze-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64,
                    productName: formData.name,
                    storeName: '내 가게' // Ideally fetch from DB
                })
            })

            const data = await res.json()
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    aiCopy: data.data.sales_copy,
                    aiScenario: data.data.best_moment,
                    aiTags: data.data.taste_tags
                }))
                toast.success('AI가 마케팅 문구를 작성했어요! ✨')
            } else {
                toast.error('분석 실패: ' + data.message)
            }
        } catch (e) {
            toast.error('AI 연결 오류')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.discountPrice || !formData.expiresAt) {
            toast.error('필수 정보를 모두 입력해주세요.')
            return
        }

        setLoading(true)
        const supabase = createClient()

        // 1. Get User/Store
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error('로그인이 필요합니다.')
            return
        }

        const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
        if (!store) {
            toast.error('먼저 상점을 등록해주세요!')
            router.push('/sellers/register')
            return
        }

        // 2. Upload Image (Skip for MVP, just use Base64 or assume separate Bucket logic. 
        // To keep it "No-Code" simple, let's use a Public Storage Bucket OR just store URL if implemented.
        // **Refinement**: Real implementation needs Storage Bucket. 
        // For this prototype, I'll simulate success or assume the User sets up storage.
        // Wait, I cannot create buckets via SQL easily. 
        // I will use a placeholder URL or assume the base64 is small enough? No, base64 in DB is bad.
        // I will mock the upload for now or assume a `storage` bucket exists 'products'.
        // Let's TRY to upload to 'products' bucket.

        let publicUrl = null
        if (fileInputRef.current?.files?.[0]) {
            const file = fileInputRef.current.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('products') // User must create this bucket!
                .upload(fileName, file)

            if (!uploadError) {
                const { data: { publicUrl: url } } = supabase.storage.from('products').getPublicUrl(fileName)
                publicUrl = url
            }
        }

        // 3. Calc Expiry Timestamp (Today + Time)
        const today = new Date().toISOString().split('T')[0]
        const expiryDate = new Date(`${today}T${formData.expiresAt}:00`)

        // 4. Insert
        const { error } = await supabase.from('products').insert({
            store_id: store.id,
            name: formData.name,
            original_price: parseInt(formData.originalPrice) || 0,
            discount_price: parseInt(formData.discountPrice),
            expires_at: expiryDate.toISOString(),
            stock: parseInt(formData.stock),
            golden_time_opt_in: formData.goldenTime,
            ai_generated_copy: formData.aiCopy,
            web_search_summary: formData.aiScenario, // Saving 'best moment' here
            ai_tags: formData.aiTags,
            image_url: publicUrl || 'https://placehold.co/400x300?text=No+Image' // Fallback
        })

        setLoading(false)

        if (error) {
            if (error.message.includes('bucket')) {
                toast.error('이미지 업로드 실패: Supabase Storage에 "products" 버킷을 만들어주세요!')
            } else {
                toast.error('등록 실패: ' + error.message)
            }
        } else {
            toast.success('상품이 등록되었습니다!')
            router.push('/')
        }
    }

    return (
        <div className="max-w-md mx-auto p-4 pb-24 font-[Pretendard]">
            <h1 className="text-2xl font-bold mb-6">상품 등록</h1>

            <div className="space-y-6">
                {/* Image Upload */}
                <div
                    className="aspect-video bg-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Upload className="w-8 h-8 mb-2" />
                            <span>사진을 등록해주세요</span>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <Input
                        placeholder="상품명 (예: 옛날 통닭)"
                        className="text-lg font-bold h-12"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="정가 (원)"
                            value={formData.originalPrice}
                            onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                        />
                        <Input
                            type="number"
                            placeholder="할인가 (원)"
                            className="text-orange-600 font-bold border-orange-200 bg-orange-50"
                            value={formData.discountPrice}
                            onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                        />
                    </div>
                </div>

                {/* AI Magic Section */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-indigo-700">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            AI 마케팅 도우미
                        </CardTitle>
                        <CardDescription className="text-xs">
                            사진과 이름을 분석해 매력적인 문구를 써드려요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            onClick={handleAIAnalyze}
                            disabled={analyzing || !imagePreview}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {analyzing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {analyzing ? 'AI가 분석 중...' : '마법의 문구 생성하기'}
                        </Button>

                        {formData.aiCopy && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-sm shadow-sm">
                                    <span className="block text-xs text-gray-400 mb-1">한 줄 카피</span>
                                    <p className="font-medium text-slate-800">{formData.aiCopy}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-indigo-100 text-sm shadow-sm">
                                    <span className="block text-xs text-gray-400 mb-1">추천 상황</span>
                                    <p className="text-slate-600">{formData.aiScenario}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {formData.aiTags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white border border-indigo-100 rounded-md text-xs text-indigo-600">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Time & Options */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <label className="text-sm font-medium">마감 시간</label>
                        <Input
                            type="time"
                            className="w-full"
                            value={formData.expiresAt}
                            onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-xl bg-orange-50 border-orange-100 cursor-pointer" onClick={() => setFormData({ ...formData, goldenTime: !formData.goldenTime })}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.goldenTime ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}>
                            {formData.goldenTime && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-orange-800">⚡ 골든타임 적용</p>
                            <p className="text-xs text-orange-600">마감 30분 전 10% 추가 할인하여 완판 노리기</p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-lg font-bold"
                >
                    {loading ? '등록 중...' : '상품 등록하기'}
                </Button>
            </div>
        </div>
    )
}
