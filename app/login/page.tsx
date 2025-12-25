'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [loading, setLoading] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    const handleSendOtp = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
        })
        setLoading(false)

        if (error) {
            toast.error('인증번호 발송 실패: ' + error.message)
        } else {
            toast.success('인증번호가 발송되었습니다.')
            setStep('otp')
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)
        const { error } = await supabase.auth.verifyOtp({
            phone: phoneNumber,
            token: otp,
            type: 'sms',
        })
        setLoading(false)

        if (error) {
            toast.error('인증 실패: ' + error.message)
        } else {
            toast.success('로그인 성공!')
            router.push('/')
            router.refresh()
        }
    }

    const handleSocialLogin = async (provider: 'kakao' | 'google') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            toast.error('소셜 로그인 실패: ' + error.message)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 rounded-3xl">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                        우리동네 떨이
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        3초 만에 시작하고 득템하세요!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="phone" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-gray-100 p-1">
                            <TabsTrigger value="phone" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">휴대폰 번호</TabsTrigger>
                            <TabsTrigger value="social" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">소셜 로그인</TabsTrigger>
                        </TabsList>

                        <TabsContent value="phone" className="mt-6 space-y-4">
                            {step === 'phone' ? (
                                <div className="space-y-4">
                                    <Input
                                        type="tel"
                                        placeholder="010-1234-5678"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all text-lg"
                                    />
                                    <Button
                                        className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg"
                                        onClick={handleSendOtp}
                                        disabled={loading || !phoneNumber}
                                    >
                                        {loading ? '발송 중...' : '인증번호 받기'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="인증번호 6자리"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all text-lg text-center tracking-widest"
                                        />
                                        <Button
                                            variant="outline"
                                            className="h-12 rounded-xl px-4"
                                            onClick={() => setStep('phone')}
                                        >
                                            재전송
                                        </Button>
                                    </div>
                                    <Button
                                        className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg"
                                        onClick={handleVerifyOtp}
                                        disabled={loading || !otp}
                                    >
                                        {loading ? '확인 중...' : '인증하기'}
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="social" className="mt-6 space-y-3">
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-none font-medium flex items-center justify-center gap-2"
                                onClick={() => handleSocialLogin('kakao')}
                            >
                                {/* Kakao Icon SVG would go here */}
                                카카오로 3초 만에 시작하기
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-2"
                                onClick={() => handleSocialLogin('google')}
                            >
                                {/* Google Icon SVG would go here */}
                                구글로 계속하기
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            {/* Toast provider needs to be in layout, but added here or root layout */}
        </div>
    )
}
