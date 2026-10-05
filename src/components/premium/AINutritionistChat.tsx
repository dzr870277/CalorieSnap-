import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Language, UserProfile } from '../../types';

interface AINutritionistChatProps {
  language: Language;
  profile: UserProfile;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AINutritionistChat: React.FC<AINutritionistChatProps> = ({
  language,
  profile,
}) => {
  const getTimeStr = () => {
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}`;
  };

  const initialMessages: Message[] = [
    {
      id: 'welcome-1',
      sender: 'ai',
      text:
        language === 'ar'
          ? `أهلاً بك يا بطل! أنا د. نور، مستشارك الغذائي الذكي في سُعرتي 🍏. لقد اطلعت على بياناتك (هدفك: ${
              profile.goal === 'lose' ? 'إنقاص الوزن' : profile.goal === 'build' ? 'بناء العضلات' : 'المحافظة على الوزن'
            }، وسعراتك المستهدفة: ${profile.targets.calories} سعرة). كيف أستطيع مساعدتك اليوم بخصوص وجباتك، التمارين، أو البدائل الصحية؟`
          : `Hello! I'm Dr. Nour, your dedicated AI Sports Nutritionist at CalorieSnap 🍏. I've synced with your profile (Goal: ${
              profile.goal === 'lose' ? 'Fat Loss' : profile.goal === 'build' ? 'Muscle Hypertrophy' : 'Maintenance'
            }, Target: ${profile.targets.calories} kcal). What nutrition or workout questions can I answer for you today?`,
      time: getTimeStr(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      ar: 'ما هي البدائل الصحية لشاورما المطاعم؟',
      en: 'Healthy alternatives to fast food shawarma?',
    },
    {
      ar: 'كيف أصل لهدفي من البروتين اليومي بسهولة؟',
      en: 'How to hit my daily protein target easily?',
    },
    {
      ar: 'أفضل وجبة خفيفة قبل التمرين لزيادة النشاط؟',
      en: 'Best pre-workout snack for sustained energy?',
    },
    {
      ar: 'هل أكل الكربوهيدرات ليلاً يمنع حرق الدهون؟',
      en: 'Does eating carbs late at night stall fat loss?',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('شاورما') || q.includes('shawarma') || q.includes('مطاعم') || q.includes('fast food')) {
      return language === 'ar'
        ? `🌯 **بديل الشاورما الصحي قليل السعرات:**\n- استبدل ساندوتش الشاورما التجاري (550+ سعرة ودهون مهدرجة) بتحضير شاورما منزلية:\n1. 180غ صدر دجاج متبل ببهارات الشاورما والزبادي والليمون.\n2. خبز بر أسمر تورتيلا خفيف.\n3. صوص الثوم الصحي: اخلط زبادي يوناني خالي الدسم مع فص ثوم ورشة ليمون.\n* النتيجة: 380 سعرة فقط مع 42غ بروتين نقي ودهون أقل بـ 70%!*`
        : `🌯 **Healthy Low-Calorie Shawarma Swap:**\nInstead of heavy fast-food shawarma wraps (550+ kcal):\n1. Use 180g skinless chicken breast marinated in yogurt and lemon.\n2. Wrap in a whole wheat tortilla.\n3. Make your garlic sauce using non-fat Greek yogurt + minced garlic + lemon.\n* Saves over 200 calories while packing 42g of clean protein!*`;
    }

    if (q.includes('بروتين') || q.includes('protein') || q.includes('عضل')) {
      return language === 'ar'
        ? `💪 **استراتيجية الوصول للبروتين اليومي (${profile.targets.protein}غ):**\n1. وزّع البروتين على 3-4 وجبات (30-40غ في كل وجبة).\n2. في الفطور: 3 بيضات كاملة + بياض بيضتين أو زبادي يوناني مع شوفان (25-30غ بروتين).\n3. في الغداء: 180غ صدر دجاج أو سلمون أو تونة (35-42غ بروتين).\n4. كسناك: مكسرات خفيفة أو سكوب واي بروتين مع ماء (25غ بروتين).\n5. العشاء: جبن قريش / فيتا لايت مع تونة أو بيض.`
        : `💪 **Strategy to Hit Your Protein Target (${profile.targets.protein}g):**\n1. Distribute across 3-4 meals (30-40g each).\n2. Breakfast: 3 eggs + 2 egg whites or Greek yogurt bowl (~30g protein).\n3. Lunch: 180g grilled chicken breast or tuna fillet (~40g protein).\n4. Snack: Whey protein scoop or edamame (~25g protein).\n5. Dinner: Low-fat cottage cheese or grilled white fish.`;
    }

    if (q.includes('تمرين') || q.includes('workout') || q.includes('قبل') || q.includes('pre')) {
      return language === 'ar'
        ? `⚡ **أفضل ما تتناوله حول التمرين:**\n- **قبل التمرين بساعة:** كربوهيدرات سريعة الهضم مع قليل من البروتين (حبتان تمر سكري مع فنجان قهوة عربية/أمريكية، أو موزة مع زبادي خفيف) لتعبئة مخازن الجلايكوجين.\n- **بعد التمرين:** وجبة متوازنة تحتوي على 25-35غ بروتين لإصلاح الألياف العضلية مع كربوهيدرات معقدة كالأرز البسمتي أو البطاطا المشوية.`
        : `⚡ **Best Pre & Post Workout Nutrition:**\n- **45-60 min Before:** Easily digestible carbs + light caffeine (2 Medjool dates + black coffee, or a banana) for sustained energy.\n- **After Workout:** 30g fast protein (whey or grilled chicken) paired with complex carbs (basmati rice or sweet potatoes) for muscle recovery.`;
    }

    if (q.includes('ليل') || q.includes('كارب') || q.includes('night') || q.includes('carbs')) {
      return language === 'ar'
        ? `🌙 **خرافة الكربوهيدرات ليلاً:**\nعلمياً، الجسم لا يحول الكربوهيدرات فجأة إلى دهون بعد الساعة 8 مساءً! ما يحدد نزول الوزن هو **إجمالي عجز السعرات على مدار 24 ساعة**. يمكنك تناول وجبة خفيفة ليلاً مادامت ضمن ميزانيتك اليومية (${profile.targets.calories} سعرة). الأفضل مساءً اختيار كربوهيدرات معقدة وألياف لتعزيز هرمون الميلاتونين ونوم عميق.`
        : `🌙 **The Late-Night Carb Myth:**\nScientifically, your body does not store carbs as fat simply because it's after 8 PM! Weight changes are driven by your **24-hour total energy balance**. As long as you stay within your daily budget (${profile.targets.calories} kcal), eating complex carbs at dinner is completely fine and even helps sleep quality.`;
    }

    // Default intelligent nutrition response
    return language === 'ar'
      ? `أحسنت السؤال! بناءً على هدفك الحالي ووزنك (${profile.weight} كجم)، أنصحك بالتركيز على جودة الأطعمة غير المصنعة وشرب ما لا يقل عن 2.5 إلى 3 لترات ماء يومياً. الالتزام بالسعرات بنسبة 85% على مدار الأسبوع هو مفتاح النتائج المستدامة دون حرمان. هل تود أن أقترح عليك توزيع وجبات يناسب جدولك؟`
      : `Great question! Based on your current weight (${profile.weight} kg) and goal, prioritize whole single-ingredient foods and drink 2.5-3 liters of water daily. Consistency at 85% adherence beats perfection every time. Would you like a custom meal distribution template?`;
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: getTimeStr(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateAnswer(text);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: getTimeStr(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Bot Persona Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900">
                {language === 'ar' ? 'د. نور - خبيرة التغذية الرياضية' : 'Dr. Nour - AI Nutritionist'}
              </h3>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                {language === 'ar' ? 'متصل الآن' : 'Active'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'ar' ? 'إجابات فورية معتمدة ومخصصة لبياناتك' : 'Evidence-based personalized advice'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(initialMessages)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          title={language === 'ar' ? 'بدء محادثة جديدة' : 'Reset chat'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/90 shadow-inner h-[380px] overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAi
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-white shadow-xs'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  isAi
                    ? 'bg-white text-slate-800 border border-slate-200/80 rounded-ss-xs'
                    : 'bg-emerald-600 text-white rounded-se-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <span
                  className={`text-[9px] mt-1.5 block text-end font-medium ${
                    isAi ? 'text-slate-400' : 'text-emerald-200'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs ps-9">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{language === 'ar' ? 'د. نور تكتب الآن...' : 'Dr. Nour is typing...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider px-1">
          {language === 'ar' ? 'أسئلة شائعة يمكنك النقر عليها مباشرة:' : 'Suggested topics:'}
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(language === 'ar' ? p.ar : p.en)}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 text-xs font-medium whitespace-nowrap shadow-xs active:scale-95 transition"
            >
              {language === 'ar' ? p.ar : p.en}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-sm"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'ar'
              ? 'اطرح سؤالك التغذوي هنا...'
              : 'Ask any diet or workout question...'
          }
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition active:scale-90"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
