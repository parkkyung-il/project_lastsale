'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SellerRegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        bizNumber: '', // 123-45-67890
        ownerName: '',
        startDate: '' // YYYYMMDD
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleVerify = async () => {
        if (!formData.bizNumber || !formData.ownerName || !formData.startDate) {
            toast.error('모든 정보를 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/verify-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    biz_number: formData.bizNumber,
                    owner_name: formData.ownerName,
                    start_date: formData.startDate
                })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast.success(`인증 성공! '${data.store.name}'이 생성되었습니다.`)
                router.push('/seller/dashboard') // Redirect to dashboard
            } else {
                toast.error(data.message || '인증에 실패했습니다.')
            }
        } catch (err) {
            toast.error('오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-[Pretendard]">
            <Card className="w-full max-w-md border-0 shadow-xl rounded-3xl overflow-hidden">
                <div className="bg-orange-500 h-2 w-full"></div>
                <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl font-bold mb-2">사장님, 환영합니다! 🎉</CardTitle>
                    <CardDescription>
                        사업자번호만 입력하면<br />
                        국세청 데이터를 통해 1초 만에 인증됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">사업자 등록번호</label>
                        <Input
                            name="bizNumber"
                            placeholder="000-00-00000"
                            value={formData.bizNumber}
                            onChange={handleChange}
                            className="h-12 text-lg bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium text-gray-700">대표자 성명</label>
                            <Input
                                name="ownerName"
                                placeholder="홍길동"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium text-gray-700">개업일자</label>
                            <Input
                                name="startDate"
                                placeholder="20231225"
                                maxLength={8}
                                value={formData.startDate}
                                onChange={handleChange}
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white text-center tracking-widest"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full h-14 mt-4 text-lg font-bold bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md hover:shadow-lg translate-y-0 hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                국세청 확인 중...
                            </>
                        ) : (
                            '1초 만에 인증하고 시작하기'
                        )}
                    </Button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        입력하신 정보는 인증 목적으로만 사용되며 저장되지 않습니다.<br />
                        (상점 정보 생성용 데이터 제외)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
