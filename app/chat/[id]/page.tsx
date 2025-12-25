'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function ChatRoomPage() {
    const { id } = useParams() // room id
    const router = useRouter()
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [userId, setUserId] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    // 1. Fetch Room & Initial Messages
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Load Messages
            const { data } = await supabase
                .from('chat_messages')
                .select(`*, sender:profiles(nickname, avatar_url)`)
                .eq('room_id', id)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
        }
        init()

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`room:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${id}`
            }, (payload) => {
                // Fetch sender info properly or just push raw structure for MVP
                // For now, let's just re-fetch or append optimistically if we can.
                // Simplest: just append payload.new and handle missing sender info gracefully
                setMessages(prev => [...prev, payload.new])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, router, supabase])

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || !userId) return

        const text = newMessage
        setNewMessage('') // Optimistic clear

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                room_id: id,
                sender_id: userId,
                message: text
            })

        if (error) {
            console.error(error)
            setNewMessage(text) // Restore on fail
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-[Pretendard]">
            {/* Header */}
            <header className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10">
                <Link href="/">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>
                <div>
                    <h1 className="font-bold text-gray-900">1:1 채팅</h1>
                    <p className="text-xs text-gray-500">구매 예약 상담</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === userId
                    return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'}`}>
                                {msg.message}
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t safe-area-pb">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-orange-200"
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <Button size="icon" className="bg-orange-500 hover:bg-orange-600 rounded-xl" onClick={handleSend}>
                        <Send className="w-4 h-4 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
