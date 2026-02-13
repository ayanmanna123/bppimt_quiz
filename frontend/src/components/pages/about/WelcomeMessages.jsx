import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Send, Mail, MessageCircle } from 'lucide-react';

const SplitText = lazy(() => import('./SplitText'));

const WelcomeMessages = () => {
    const messages = [
        {
            title: "Message from the Chairman",
            name: "Shri. Arun Poddar",
            role: "Chairman",
            image: "/Chairman.png",
            content: [
                "Today students have to face challenges that don't just test their knowledge but also their leadership skills.",
                "At B. P. Poddar Institute of Management and Technology, we train them to think on their feet. The institute believes in leveraging the talent of each individual by providing a holistic and exciting learning environment - a space that adds to their confidence by honing on their analytical and communication skills."
            ]
        },
        {
            title: "Message from the Founder Trustee & Chief Mentor",
            name: "Dr. Subir Choudhury",
            role: "Founder Trustee & Chief Mentor",
            image: "/Director.png",
            content: [
                "A technologically dynamic environment is what BPPIMT – a fully integrated technological institute boasts of. Here students are encouraged to explore and integrate innovative solutions that in turn will influence engineering practices across the world.",
                "Regular consulting assignments are undertaken, student and faculty development programmes are conducted to identify and incubate potential with the right attitude. Every member of the BPPIMT family is trained to excel and add value to whatever they pursue be it in education, research, consulting or training."
            ]
        },
        {
            title: "Message from the Principal",
            name: "Prof. (Dr.) Sutapa Mukherjee",
            role: "Principal",
            image: "/Principal.png", // Using as placeholder
            content: [
                "We take pride of a holistic learning environment which plays a vital role in grooming new age technocrats. The Institute has a large pool of highly qualified and dedicated faculty members who strive to achieve excellence both in education and research to nurture the budding talents.",
                "In addition to curricular and co-curricular learning, the Institute inculcates moral values and professional ethics enabling the future engineers to develop as good human beings for the benefit of society as a whole."
            ]
        }
    ];

    const socialIcons = [
        { icon: Facebook, color: "text-blue-600" },
        { icon: Twitter, color: "text-slate-950" }, // X icon
        { icon: MessageCircle, color: "text-green-500" }, // WhatsApp
        { icon: Send, color: "text-sky-500" }, // Telegram
        { icon: Mail, color: "text-slate-500" }, // Email
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
        >
            <div className="text-center space-y-4">
                <Suspense fallback={<h1 className="text-4xl font-bold text-slate-900 leading-tight">Welcome Messages</h1>}>
                    <SplitText
                        text="Welcome Messages"
                        className="text-4xl md:text-5xl font-black text-slate-900 leading-tight"
                        delay={50}
                        duration={0.5}
                        textAlign="center"
                        tag="h1"
                    />
                </Suspense>

                {/* Social Icons Row */}
                <div className="flex justify-center gap-5 py-2 border-b border-slate-200/60 max-w-sm mx-auto">
                    {socialIcons.map((social, i) => (
                        <motion.a
                            key={i}
                            href="#"
                            whileHover={{ y: -3, scale: 1.1 }}
                            className={`${social.color} transition-colors p-1`}
                        >
                            <social.icon className="w-5 h-5" />
                        </motion.a>
                    ))}
                </div>
            </div>

            <div className="space-y-16">
                {messages.map((msg, index) => (
                    <section key={index} className="space-y-6">
                        <div className="relative inline-block">
                            <h2 className="text-2xl md:text-4xl font-serif text-slate-800 border-b-2 border-[#E11D48] pb-1">
                                {msg.title}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-[#1A1A4E]">
                                {msg.name} <span className="text-slate-400 font-light mx-1">|</span> {msg.role}
                            </h3>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="w-full md:w-[320px] shrink-0 border-2 border-slate-900 rounded shadow-sm overflow-hidden"
                                >
                                    <img
                                        src={msg.image}
                                        alt={msg.name}
                                        className="w-full h-auto object-cover aspect-[4/3]"
                                    />
                                </motion.div>

                                <div className="flex-1 space-y-4 text-slate-700 leading-relaxed text-lg font-medium">
                                    {msg.content.map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </motion.div>
    );
};

export default WelcomeMessages;
