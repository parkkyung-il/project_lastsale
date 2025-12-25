import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { imageBase64, storeName, productName } = body

        if (!imageBase64 || !productName) {
            return NextResponse.json({ message: '이미지와 상품명은 필수입니다.' }, { status: 400 })
        }

        // 1. Web Search (Serper.dev) for "Qualitative Verification"
        // We search for reviews or general info about this type of food/store
        const serenityQuery = `${storeName || ''} ${productName} 맛집 후기`
        let searchContext = "검색 결과가 없습니다."

        if (process.env.SERPER_API_KEY) {
            try {
                const serperRes = await fetch('https://google.serper.dev/search', {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': process.env.SERPER_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ q: serenityQuery, gl: 'kr', hl: 'ko' })
                })
                const serperData = await serperRes.json()
                if (serperData.organic && serperData.organic.length > 0) {
                    // Summarize top 3 snippets
                    searchContext = serperData.organic.slice(0, 3).map((item: any) => `- ${item.snippet}`).join('\n')
                }
            } catch (searchErr) {
                console.error('Serper Error:', searchErr)
                // Proceed without search properties if fails
            }
        }

        // 2. Gemini Analysis
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
      당신은 '우리동네 떨이' 앱의 AI 마케팅 전문가입니다. 
      
      [입력 정보]
      1. 웹 검색 결과(평판/특징):
      ${searchContext}
      2. 상품명: ${productName}
      
      [요구사항]
      제공된 음식 사진과 위 검색 결과를 바탕으로 JSON 형식으로 답해주세요.
      1. sales_copy: 고객이 지금 당장 사고 싶게 만드는 매력적인 한 줄 카피 (20자 이내, 이모지 1개 포함)
      2. best_moment: 이 음식을 먹기 가장 좋은 상황 (예: "비 오는 날 막걸리와 함께", "출출한 야식으로")
      3. taste_tags: 맛이나 식감을 표현하는 태그 3개 (예: ["바삭바삭", "매콤달콤", "육즙가득"])
      
      응답은 오직 JSON만 주세요.
      Example: {"sales_copy": "🔥 스트레스 풀리는 매운맛!", "best_moment": "금요일 밤 맥주 안주로", "taste_tags": ["매움", "쫄깃", "중독성"]}
    `

        // Remove header from base64 if present (e.g. data:image/jpeg;base64,)
        const base64Data = imageBase64.split(',')[1] || imageBase64

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ])

        const responseText = result.response.text()

        // Clean code block markers if present
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
        const analyzedData = JSON.parse(cleanJson)

        return NextResponse.json({ success: true, data: analyzedData })

    } catch (error: any) {
        console.error('AI Error:', error)
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
