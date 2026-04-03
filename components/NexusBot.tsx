'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Paperclip, CreditCard, ChevronRight } from 'lucide-react';

export default function NexusBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string, text: string, isBot: boolean, type?: 'action' | 'text', link?: string }[]>([
    { id: '1', text: '¡Hola! Soy NexusBot 🤖. Tu asistente escolar inteligente. ¿En qué te ayudo hoy?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, isBot: false }]);
    setInputText('');

    setTimeout(() => {
      let botResponse = 'Entiendo. Estoy aprendiendo sobre esto, por favor contacta soporte.';
      let actionType: 'action' | 'text' | undefined = undefined;
      
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('nota') || lower.includes('bolet')) {
        botResponse = 'He revisado el sistema. El estudiante tiene un promedio de 85/100 este periodo. ¿Deseas descargar el histórico?';
      } else if (lower.includes('deud') || lower.includes('pago') || lower.includes('pensi') || lower.includes('pension')) {
        botResponse = 'Revisando tu estado financiero... Tienes una factura vencida por $150,000 COP correspondiente a Marzo.';
        actionType = 'action';
      } else if (lower.includes('paz') || lower.includes('salvo')) {
         botResponse = 'Para generar el paz y salvo debes estar al día con tesorería. ¿Deseas descargar el estado financiero?';
      }

      setMessages(prev => [...prev, actionType ? { 
        id: (Date.now() + 1).toString(), 
        text: botResponse, 
        isBot: true,
        type: actionType as 'action' | 'text'
      } : { 
        id: (Date.now() + 1).toString(), 
        text: botResponse, 
        isBot: true 
      }]);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '24px',
              width: '380px',
              height: '550px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9999
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>NexusBot (IA)</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <span style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', display: 'inline-block' }}></span> En línea
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isBot ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderBottomLeftRadius: msg.isBot ? '4px' : '16px',
                    borderBottomRightRadius: !msg.isBot ? '4px' : '16px',
                    background: msg.isBot ? '#f1f5f9' : 'var(--primary)',
                    color: msg.isBot ? 'var(--text-main)' : 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    lineHeight: '1.5',
                    boxShadow: msg.isBot ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }}>
                    {msg.text}
                  </div>
                  
                  {msg.type === 'action' && msg.isBot && (
                     <div style={{ marginTop: '8px', width: '85%', padding: '12px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <span style={{ fontSize: '13px', fontWeight: '800', color: '#ef4444' }}>Vencimiento Marzo</span>
                           <span style={{ fontSize: '14px', fontWeight: '900' }}>$150,000</span>
                        </div>
                        <button style={{ width: '100%', padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                          <CreditCard size={14} /> Pagar ahora
                        </button>
                     </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Recommended Prompts */}
            <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', overflowX: 'auto' }} className="hide-scroll">
               <button onClick={() => { setInputText('¿Cuáles son mis notas?'); handleSend(); }} style={{ whiteSpace: 'nowrap', padding: '6px 12px', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '100px', background: 'transparent', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Ver notas</button>
               <button onClick={() => { setInputText('¿Cuánto debo?'); handleSend(); }} style={{ whiteSpace: 'nowrap', padding: '6px 12px', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '100px', background: 'transparent', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Deudas</button>
               <button onClick={() => { setInputText('Paz y Salvo'); handleSend(); }} style={{ whiteSpace: 'nowrap', padding: '6px 12px', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '100px', background: 'transparent', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Paz y Salvo</button>
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center', background: 'white' }}>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Escribe tu consulta aquí..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1, border: 'none', outline: 'none', background: '#f8fafc', padding: '12px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: '500' }}
              />
              <button 
                onClick={handleSend}
                style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', opacity: inputText.trim() ? 1 : 0.5 }}
                disabled={!inputText.trim()}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          border: 'none',
          color: 'white',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        
        {/* Unread badge mock */}
        {!isOpen && (
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
        )}
      </motion.button>
      
      <style jsx>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { scrollbar-width: none; }
      `}</style>
    </>
  );
}
