import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Book, User, Sparkles, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Welcome to the Archives. I am your literary concierge. How may I assist your pursuit of knowledge today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const response = generateResponse(userMsg.text);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: response,
                    sender: "bot",
                    timestamp: new Date(),
                },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
            return "Greetings. A fine day for literary discovery, isn't it?";
        }
        if (lowerInput.includes("order") || lowerInput.includes("tracking")) {
            return "Your acquisitions are logged in the historical registry. You may consult the 'Orders' archive in your portal for real-time logistics.";
        }
        if (lowerInput.includes("shipping") || lowerInput.includes("delivery")) {
            return "We dispatch our volumes via premium courier services. Priority transit is complimentary for registrations exceeding $50.";
        }
        if (lowerInput.includes("return") || lowerInput.includes("refund")) {
            return "Our collection standard is absolute. Should a volume not meet your expectations, the return protocol is active for 30 solar days post-acquisition.";
        }
        if (lowerInput.includes("recommend") || lowerInput.includes("suggestion")) {
            return "I would be honored to curate a selection. Are you inclined towards modern Fiction, or perhaps the enigmatic depths of Mystery?";
        }
        if (lowerInput.includes("fiction")) {
            return "In our contemporary fiction wing, 'The Midnight Library' is currently receiving high intellectual acclaim.";
        }
        if (lowerInput.includes("mystery")) {
            return "For those who appreciate the shadows, 'The Silent Patient' offers a narrative structure of profound complexity.";
        }

        return "An intriguing inquiry. While my logic gates are specialized in repository management, our master librarians at concierge@bookishbliss.com possess the deeper insights you seek.";
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            {isOpen && (
                <Card className="w-[380px] md:w-[420px] h-[600px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border-brand-primary/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500 rounded-[3rem] bg-white/90 backdrop-blur-2xl">
                    {/* Header */}
                    <div className="bg-brand-black p-6 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-bl-[4rem]" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center shadow-lg">
                                <Book className="w-6 h-6 text-white fill-white" />
                            </div>
                            <div>
                                <h3 className="font-serif font-black italic text-lg leading-none">Bliss Concierge</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-secondary mt-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                                    Link Active
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 h-10 w-10 rounded-xl relative z-10"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-6 bg-[#FEF7EB]/30">
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-end gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                        }`}
                                >
                                    <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                                        {msg.sender === "bot" ? (
                                            <AvatarFallback className="bg-brand-black text-brand-secondary"><Book className="w-5 h-5" /></AvatarFallback>
                                        ) : (
                                            <AvatarFallback className="bg-brand-secondary text-brand-black"><User className="w-5 h-5" /></AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div
                                        className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm shadow-sm relative overflow-hidden ${msg.sender === "user"
                                            ? "bg-brand-black text-white rounded-tr-none"
                                            : "bg-white border border-brand-primary/5 text-brand-black rounded-tl-none"
                                            }`}
                                    >
                                        {msg.sender === "bot" && (
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-brand-primary/5 rounded-bl-[2rem]" />
                                        )}
                                        <span className="relative z-10 font-medium leading-relaxed">{msg.text}</span>
                                        <div className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-40 text-right`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-end gap-3">
                                    <Avatar className="w-10 h-10 border-2 border-white shadow-md">
                                        <AvatarFallback className="bg-brand-black text-brand-secondary"><Book className="w-5 h-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="bg-white border border-brand-primary/5 rounded-3xl rounded-tl-none px-5 py-4 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-6 bg-white border-t border-brand-primary/5">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-3"
                        >
                            <Input
                                placeholder="Consult the concierge..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-1 h-14 bg-brand-light/50 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-primary/10 rounded-2xl font-bold placeholder:text-brand-grey/30 transition-all px-6"
                            />
                            <Button type="submit" size="icon" disabled={!inputText.trim()} className="h-14 w-14 shrink-0 bg-brand-black text-brand-secondary hover:bg-brand-secondary hover:text-brand-black transition-all rounded-2xl shadow-lg active:scale-95">
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <div className="relative group">
                    <div className="absolute -inset-4 bg-brand-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="lg"
                        className="h-18 w-18 rounded-[2rem] shadow-2xl hover:scale-110 transition-all duration-500 bg-brand-black text-brand-secondary border-2 border-brand-primary/10 relative z-10 group-hover:rotate-12"
                    >
                        <div className="absolute top-0 right-0 w-4 h-4 bg-brand-secondary rounded-full border-[3px] border-brand-black animate-pulse shadow-[0_0_15px_rgba(255,172,47,0.8)]"></div>
                        <MessageCircle className="w-8 h-8" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
