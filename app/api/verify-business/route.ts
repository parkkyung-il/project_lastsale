import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { biz_number, owner_name, start_date } = body

        // 1. Basic Validation
        if (!biz_number || !owner_name || !start_date) {
            return NextResponse.json(
                { message: '사업자번호, 대표자성명, 개업일자는 필수입니다.' },
                { status: 400 }
            )
        }

        // 2. Call National Tax Service (NTS) API
        // Doc: https://www.data.go.kr/data/15081808/openapi.do
        // API Endpoint: https://api.odcloud.kr/api/nts-businessman/v1/validate
        const ntsUrl = `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${process.env.NTS_API_KEY}`

        const ntsResponse = await fetch(ntsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                businesses: [
                    {
                        b_no: biz_number.replace(/-/g, ''), // Remove dashes
                        start_dt: start_date.replace(/-/g, ''), // YYYYMMDD
                        p_nm: owner_name
                    }
                ]
            })
        })

        if (!ntsResponse.ok) {
            const errorText = await ntsResponse.text()
            console.error('NTS API Error:', errorText)
            return NextResponse.json({ message: '국세청 API 호출 실패' }, { status: 502 })
        }

        const ntsData = await ntsResponse.json()
        const result = ntsData.data?.[0]

        // 3. Check Status
        // valid: "01" (valid)
        if (result?.valid === '01') {
            // 4. Update Supabase User -> Store
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
            }

            // Create Store
            const { data: store, error: dbError } = await supabase
                .from('stores')
                .insert({
                    owner_id: user.id,
                    name: `${owner_name}의 가게`, // Default name
                    biz_number: biz_number,
                    biz_owner_name: owner_name,
                    biz_start_date: start_date,
                    tax_api_verified_at: new Date().toISOString() // Verified!
                })
                .select()
                .single()

            if (dbError) {
                console.error('DB Error:', dbError)
                return NextResponse.json({ message: '상점 생성 실패: ' + dbError.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, store })
        } else {
            // Invalid status (closed, or mismatch)
            const statusMsg = result?.status?.b_stt_cd || '정보 불일치'
            return NextResponse.json({ success: false, message: `사업자 인증 실패 (상태: ${statusMsg}, ${result?.status?.b_stt})` }, { status: 200 })
        }

    } catch (error: any) {
        console.error('Server Error:', error)
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
