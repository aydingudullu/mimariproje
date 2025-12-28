'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { messagesApi, type Conversation, type Message, type User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Send, 
  Paperclip, 
  ArrowLeft,
  CheckCheck,
  Loader2,
  Trash2,
  Terminal,
  Activity,
  Cpu,
  Hash,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/giris?redirect=/mesajlar');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await messagesApi.getConversations();

      if (response.success && response.data) {
        setConversations(response.data.conversations || []);
      } else {
        throw new Error(response.error || 'Failed to load communication logs');
      }
    } catch (err: any) {
      console.error('Fetch conversations error:', err);
      // Silent error for polling if it's just a network blip, but set error on initial load
      if (!pollingRef.current) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    try {
      setIsLoadingMessages(true);
      const response = await messagesApi.getMessages(conversationId);

      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        
        // Update unread count locally to avoid jitter before next poll
        setConversations(prev => 
          prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
        );
      } else {
        throw new Error(response.error || 'Failed to retrieve message logs');
      }
    } catch (err: any) {
      console.error('Fetch messages error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  // Polling for new messages
  useEffect(() => {
    if (isAuthenticated && selectedConversation) {
      pollingRef.current = setInterval(() => {
        // Poll messages for active conversation
        messagesApi.getMessages(selectedConversation.id).then(res => {
            if (res.success && res.data) {
                // Only update if different to avoid re-renders? 
                // For simplicity, just update. optimizing might be needed if flickering occurs.
                setMessages(res.data.messages || []);
            }
        });
        
        // Poll list for new conversations or unread counts
        fetchConversations();
      }, 5000); 
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAuthenticated, selectedConversation, fetchConversations]);

  // Select conversation from URL params
  useEffect(() => {
    const conversationId = searchParams.get('id');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(conversationId));
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
    fetchMessages(conversation.id);
    messageInputRef.current?.focus();
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const response = await messagesApi.sendMessage(selectedConversation.id, {
        content: messageContent,
        message_type: 'text'
      });

      if (response.success && response.data) {
        // Add message to list
        const sentMsg = response.data.sent_message;
        setMessages(prev => [...prev, sentMsg]);
        
        // Update conversation last message
        setConversations(prev => 
          prev.map(c => 
            c.id === selectedConversation.id 
              ? { 
                  ...c, 
                  last_message: sentMsg,
                  last_message_at: sentMsg.created_at
                }
              : c
          ).sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime())
        );
      } else {
        throw new Error(response.error || 'Transmission failed');
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      setNewMessage(messageContent); // Restore message on error
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await messagesApi.deleteMessage(messageId);

      if (!response.success) {
        throw new Error(response.error || 'Delete failed');
      }

      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherUser = conv.other_user;
    if (!otherUser) return false;

    const fullName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.toLowerCase();
    const company = otherUser.company_name?.toLowerCase() || '';
    return fullName.includes(searchQuery.toLowerCase()) || company.includes(searchQuery.toLowerCase());
  });

  // Format time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    } catch {
      return '';
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Loading state
  if (authLoading || (isLoading && !conversations.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="w-3 h-3 bg-black dark:bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-3 h-3 bg-black dark:bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-3 h-3 bg-black dark:bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
             <span className="font-mono text-xs tracking-widest uppercase">Initializing Comm Link...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans overflow-hidden">
        {/* BACKGROUND GRID */}
        <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg className="w-full h-full" width="100%" height="100%">
            <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
        </div>

        {/* CONTAINER */}
        <div className="relative z-10 flex h-screen pt-20">
            {/* LEFT PANEL: CONVERSATIONS */}
            <div className={`w-full lg:w-[350px] xl:w-[400px] border-r border-black/10 dark:border-white/10 flex flex-col bg-white/50 dark:bg-black/50 backdrop-blur-sm ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-6 h-6" />
                            <h2 className="font-black italic text-2xl uppercase tracking-tighter">Comms</h2>
                        </div>
                        <div className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold font-mono">
                            {conversations.reduce((acc, c) => acc + c.unread_count, 0)} PENDING
                        </div>
                    </div>
                    <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                         </div>
                         <input
                            type="text"
                            placeholder="SEARCH FREQUENCY..."
                            className="block w-full pl-10 pr-3 py-3 border-b-2 border-black/10 dark:border-white/10 bg-transparent focus:border-black dark:focus:border-white focus:outline-none font-mono text-sm transition-colors placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center opacity-50">
                            <Activity className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-mono text-xs uppercase">No active frequencies</p>
                        </div>
                    ) : (
                        <div className="grid">
                             {filteredConversations.map((conversation) => {
                                 const otherUser = conversation.other_user;
                                 if (!otherUser) return null;

                                 return (
                                     <div 
                                        key={conversation.id}
                                        onClick={() => handleSelectConversation(conversation)}
                                        className={`
                                            group relative p-6 cursor-pointer border-b border-black/5 dark:border-white/5 transition-all duration-300
                                            ${selectedConversation?.id === conversation.id 
                                                ? 'bg-black text-white dark:bg-white dark:text-black' 
                                                : 'hover:bg-slate-100 dark:hover:bg-white/5'}
                                        `}
                                     >
                                         <div className="flex items-start gap-4">
                                             {/* Avatar / Status */}
                                             <div className="relative">
                                                 <Avatar className={`w-12 h-12 rounded-none border border-current ${selectedConversation?.id === conversation.id ? 'border-white dark:border-black' : 'border-black/20 dark:border-white/20'}`}>
                                                     <AvatarImage src={otherUser.avatar_url || ''} />
                                                     <AvatarFallback className="rounded-none bg-transparent font-bold">
                                                         {otherUser.first_name?.charAt(0) || 'U'}
                                                     </AvatarFallback>
                                                 </Avatar>
                                                 <div className={`absolute -top-1 -right-1 w-3 h-3 border border-current ${
                                                     otherUser.is_online ? 'bg-green-500' : 'bg-gray-400'
                                                 }`} />
                                             </div>

                                             <div className="flex-1 min-w-0">
                                                  <div className="flex items-baseline justify-between mb-1">
                                                      <h4 className="font-bold uppercase tracking-wide text-sm truncate">
                                                          {otherUser.company_name || `${otherUser.first_name} ${otherUser.last_name}`}
                                                      </h4>
                                                      <span className={`text-[10px] font-mono opacity-60`}>
                                                          {conversation.last_message && formatTime(conversation.last_message.created_at)}
                                                      </span>
                                                  </div>
                                                  <p className={`text-xs font-mono truncate opacity-60 ${selectedConversation?.id === conversation.id ? 'opacity-80' : ''}`}>
                                                      <span className="mr-2 opacity-50">::</span>
                                                      {conversation.last_message?.content || 'NO DATA'}
                                                  </p>
                                             </div>
                                         </div>

                                         {/* Decorative corner */}
                                         <div className={`absolute top-0 right-0 w-2 h-2 border-l border-b border-current opacity-0 group-hover:opacity-100 transition-opacity ${selectedConversation?.id === conversation.id ? 'opacity-100' : ''}`} />
                                     </div>
                                 );
                             })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: CHAT */}
            <div className={`flex-1 flex flex-col relative bg-white dark:bg-[#0a0a0a] ${!showMobileChat && !selectedConversation ? 'hidden lg:flex' : 'flex'} ${showMobileChat ? 'fixed inset-0 z-50' : ''}`}>
                
                {selectedConversation && selectedConversation.other_user ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex-shrink-0 h-20 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-[#0a0a0a]">
                             <div className="flex items-center gap-4">
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="lg:hidden"
                                    onClick={() => setShowMobileChat(false)}
                                 >
                                     <ArrowLeft className="w-5 h-5" />
                                 </Button>
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <span className="w-2 h-2 bg-green-500 animate-pulse" />
                                         <h2 className="font-black uppercase tracking-widest text-lg">
                                             {selectedConversation.other_user.company_name || `${selectedConversation.other_user.first_name} ${selectedConversation.other_user.last_name}`}
                                         </h2>
                                     </div>
                                     <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-gray-500 mt-1">
                                         <span>ID: {selectedConversation.other_user.id.toString().padStart(6, '0')}</span>
                                         <span>//</span>
                                         <span>{selectedConversation.other_user.is_online ? 'LINK: STABLE' : 'LINK: OFFLINE'}</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="rounded-none border-black/20 dark:border-white/20">
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-none border-black/20 dark:border-white/20">
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                             </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 dark:bg-black/20">
                            {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <Hash className="w-24 h-24 mb-4" />
                                    <h3 className="text-2xl font-black uppercase">Start Sequence</h3>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isMe = message.sender_id === user?.id;
                                    const canDelete = isMe && new Date().getTime() - new Date(message.created_at).getTime() < 15 * 60 * 1000;
                                    
                                    return (
                                        <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] sm:max-w-[60%] group relative`}>
                                                {/* Meta */}
                                                <div className={`flex items-center gap-2 mb-1 text-[10px] font-mono uppercase opacity-50 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <span>{isMe ? 'OUTGOING' : 'INCOMING'}</span>
                                                    <span>::</span>
                                                    <span>{formatMessageTime(message.created_at)}</span>
                                                </div>
                                                
                                                {/* Bubble */}
                                                <div className={`
                                                    p-6 border 
                                                    ${isMe 
                                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                                        : 'bg-white text-black border-black/10 dark:bg-black dark:text-gray-300 dark:border-white/10'}
                                                `}>
                                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                                                        {message.content}
                                                    </p>
                                                </div>
                                                
                                                {/* Status Marker */}
                                                {isMe && message.is_read && (
                                                     <div className="absolute -bottom-4 right-0 text-[10px] font-mono text-blue-500 flex items-center gap-1">
                                                         <CheckCheck className="w-3 h-3" />
                                                         READ
                                                     </div>
                                                )}

                                                {/* Actions */}
                                                {canDelete && (
                                                    <button 
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                        className={`absolute top-0 -right-8 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="flex-shrink-0 p-6 bg-white dark:bg-[#0a0a0a] border-t border-black/10 dark:border-white/10">
                            <form onSubmit={handleSendMessage} className="relative flex items-end gap-0 border-2 border-black dark:border-white/20 hover:border-black/50 transition-colors">
                                <div className="pl-4 py-4 self-center opacity-50">
                                    <span className="font-mono text-xs text-blue-600 animate-pulse">{'>'}</span>
                                </div>
                                <Input
                                    ref={messageInputRef}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="ENTER COMMAND..."
                                    className="flex-1 border-none shadow-none focus-visible:ring-0 rounded-none bg-transparent py-4 h-auto font-mono text-sm"
                                    disabled={isSending}
                                />
                                <div className="flex items-center gap-2 pr-2 pb-2">
                                     <Button type="button" variant="ghost" size="icon" className="rounded-none hover:bg-black/5">
                                         <Paperclip className="w-4 h-4" />
                                     </Button>
                                     <Button 
                                        type="submit" 
                                        disabled={isSending || !newMessage.trim()}
                                        className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs px-6"
                                     >
                                         {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEND'}
                                     </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                        <div className="w-24 h-24 border border-current flex items-center justify-center mb-6 rounded-full border-dashed animate-[spin_10s_linear_infinite]">
                             <Cpu className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white">System Ready</h2>
                        <p className="font-mono text-sm max-w-md">Initialize a protocol by selecting a frequency from the left command panel.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}