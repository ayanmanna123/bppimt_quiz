import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, FileText, BookOpen, GraduationCap, Calendar, ChevronDown, Sparkles, Filter, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const PYQ = () => {
    const { darktheme } = useSelector((store) => store.auth);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedStream, setSelectedStream] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Mock data for subjects based on selection
    // In a real scenario, this could come from an API or a manifest file
    const mockSubjects = {
        "CSE": {
            "6TH": ["Computer Networks", "Software Engineering", "Microprocessors", "Compiler Design", "Optimization Techniques"],
            "4TH": ["Data Structures", "Computer Organization", "Formal Language & Automata", "Mathematics-III"]
        },
        "IT": {
            "6TH": ["Computer Networks", "Software Engineering", "E-Commerce", "Web Technology"],
        },
        "EE": {
            "6TH": ["Power System-II", "Control System-II", "Microprocessor & Microcontrollers", "Digital Signal Processing"],
        },
        "ECE": {
            "6TH": ["Control System", "Digital Communication", "Microprocessor & Microcontrollers", "Data Structures"],
        }
    };

    const years = ["2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024"];
    const streams = [
        { value: "CSE", label: "Computer Science & Engineering" },
        { value: "IT", label: "Information Technology" },
        { value: "ECE", label: "Electronics & Communication Engineering" },
        { value: "EE", label: "Electrical Engineering" },
    ];
    const semesters = ["1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH"];

    const handleSearch = () => {
        if (!selectedYear || !selectedStream || !selectedSemester) {
            toast.error("Please select all fields to search");
            return;
        }

        setIsSearching(true);
        // Simulate API delay
        setTimeout(() => {
            setIsSearching(false);
            setShowResults(true);
        }, 800);
    };

    const getPdfUrl = (subject) => {
        // Structure: PYQ/[Stream]/[Year]/[Semester]/[Subjectname].pdf
        // Replacing spaces with underscores or keeping them as per user requirement
        // User example: EE/2022-2023/6TH/Subjectname
        return `/PYQ/${selectedStream}/${selectedYear}/${selectedSemester}/${subject}.pdf`;
    };

    const currentSubjects = mockSubjects[selectedStream]?.[selectedSemester] || ["Sample Subject 1", "Sample Subject 2"];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 px-4 md:px-8 transition-colors duration-500">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/4"></div>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-6">
                        <Database className="w-4 h-4" />
                        <span>Digital Document Archive</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4">
                        Previous Year Questions
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                        Access organized PYQs to boost your exam preparation. Simply choose your stream, year, and semester to find what you need.
                    </p>
                </motion.div>

                {/* Search Panel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 rounded-3xl shadow-2xl mb-12"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Year Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 pl-1">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Select Year
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-2 hover:border-blue-400 dark:hover:border-blue-500 transition-all font-medium text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        {selectedYear || "Choose Academic Year"}
                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[calc(100vw-3rem)] md:w-64 rounded-2xl p-2 dark:bg-slate-800 dark:border-slate-700">
                                    {years.map(y => (
                                        <DropdownMenuItem
                                            key={y}
                                            onClick={() => setSelectedYear(y)}
                                            className="rounded-xl cursor-pointer p-3 focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-blue-600 dark:focus:text-blue-400 dark:text-slate-200"
                                        >
                                            {y}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Stream Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 pl-1">
                                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Select Stream
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        {streams.find(s => s.value === selectedStream)?.label || "Choose Your Stream"}
                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[calc(100vw-3rem)] md:w-72 rounded-2xl p-2 dark:bg-slate-800 dark:border-slate-700">
                                    {streams.map(s => (
                                        <DropdownMenuItem
                                            key={s.value}
                                            onClick={() => setSelectedStream(s.value)}
                                            className="rounded-xl cursor-pointer p-3 focus:bg-indigo-50 dark:focus:bg-indigo-900/30 focus:text-indigo-600 dark:focus:text-indigo-400 dark:text-slate-200"
                                        >
                                            {s.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Semester Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 pl-1">
                                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                Select Semester
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-2 hover:border-purple-400 dark:hover:border-purple-500 transition-all font-medium text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                        {selectedSemester || "Choose Semester"}
                                        <ChevronDown className="w-4 h-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[calc(100vw-3rem)] md:w-64 rounded-2xl p-2 dark:bg-slate-800 dark:border-slate-700">
                                    {semesters.map(sem => (
                                        <DropdownMenuItem
                                            key={sem}
                                            onClick={() => setSelectedSemester(sem)}
                                            className="rounded-xl cursor-pointer p-3 focus:bg-purple-50 dark:focus:bg-purple-900/30 focus:text-purple-600 dark:focus:text-purple-400 dark:text-slate-200"
                                        >
                                            {sem} SEMESTER
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Searching Archive...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Search for PYQs
                            </div>
                        )}
                    </Button>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xl uppercase tracking-wider">
                                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Results for {selectedStream} | {selectedSemester} | {selectedYear}
                                </div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {currentSubjects.length} subjects found
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentSubjects.map((subject, idx) => (
                                    <motion.div
                                        key={subject}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-default"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                                    {subject}
                                                </h3>
                                                <p className="text-xs font-semibold text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 uppercase tracking-tighter">
                                                    Regular Examination Archive
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={getPdfUrl(subject)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all transform active:scale-95 shadow-inner"
                                            title="Download Question Paper"
                                            onClick={(e) => {
                                                // In development, handle missing files gracefully
                                                // toast.info(`Attempting to download: ${subject}.pdf`);
                                            }}
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Note for developer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-500">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-1">Developer Note</h4>
                                        <p className="text-sm text-amber-800 dark:text-amber-500/80 leading-relaxed">
                                            To make these downloads work, please ensure the PDF files are uploaded to your <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded font-mono">public/PYQ/</code> folder following the structure:
                                            <br />
                                            <span className="font-mono text-xs mt-2 block bg-white/50 dark:bg-black/20 p-2 rounded">
                                                PYQ / [Stream] / [Year] / [Semester] / [SubjectName].pdf
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!showResults && !isSearching && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600"
                    >
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="font-medium">Selected criteria will appear here</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PYQ;
