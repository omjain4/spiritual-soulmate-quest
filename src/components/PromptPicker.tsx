import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    PROMPT_OPTIONS,
    PROMPT_CATEGORIES,
    MAX_PROMPTS,
    type PromptOption,
} from "@/lib/promptOptions";

interface SelectedPrompt {
    question: string;
    answer: string;
}

interface PromptPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPrompts: SelectedPrompt[];
    onSave: (prompts: SelectedPrompt[]) => void;
}

type PickerStep = "list" | "browse" | "answer";

const PromptPicker = ({ open, onOpenChange, currentPrompts, onSave }: PromptPickerProps) => {
    const [step, setStep] = useState<PickerStep>("list");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPrompt, setSelectedPrompt] = useState<PromptOption | null>(null);
    const [answerText, setAnswerText] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [localPrompts, setLocalPrompts] = useState<SelectedPrompt[]>([]);

    // Reset state when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setLocalPrompts([...currentPrompts]);
            setStep("list");
            setSelectedCategory(null);
            setSearchQuery("");
            setSelectedPrompt(null);
            setAnswerText("");
            setEditingIndex(null);
        }
        onOpenChange(isOpen);
    };

    // Already-used prompt questions
    const usedQuestions = useMemo(
        () => new Set(localPrompts.map((p) => p.question)),
        [localPrompts]
    );

    // Filtered prompts for browse view
    const filteredPrompts = useMemo(() => {
        let prompts = PROMPT_OPTIONS.filter((p) => !usedQuestions.has(p.question));
        if (selectedCategory) {
            prompts = prompts.filter((p) => p.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            prompts = prompts.filter((p) => p.question.toLowerCase().includes(q));
        }
        return prompts;
    }, [selectedCategory, searchQuery, usedQuestions]);

    const handleSelectPrompt = (prompt: PromptOption) => {
        setSelectedPrompt(prompt);
        setAnswerText("");
        setStep("answer");
    };

    const handleSaveAnswer = () => {
        if (!answerText.trim()) return;

        const newPrompt: SelectedPrompt = {
            question: selectedPrompt?.question || "",
            answer: answerText.trim(),
        };

        if (editingIndex !== null) {
            // Editing existing prompt
            const updated = [...localPrompts];
            updated[editingIndex] = newPrompt;
            setLocalPrompts(updated);
        } else {
            // Adding new prompt
            setLocalPrompts([...localPrompts, newPrompt]);
        }

        setStep("list");
        setSelectedPrompt(null);
        setAnswerText("");
        setEditingIndex(null);
    };

    const handleEditPrompt = (index: number) => {
        const prompt = localPrompts[index];
        const matchingOption = PROMPT_OPTIONS.find((p) => p.question === prompt.question);
        setEditingIndex(index);
        setSelectedPrompt(matchingOption || { id: `custom-${index}`, question: prompt.question, category: "about-me", emoji: "✏️" });
        setAnswerText(prompt.answer);
        setStep("answer");
    };

    const handleDeletePrompt = (index: number) => {
        setLocalPrompts(localPrompts.filter((_, i) => i !== index));
    };

    const handleSaveAll = () => {
        onSave(localPrompts);
        onOpenChange(false);
    };

    const handleAddNew = () => {
        setEditingIndex(null);
        setSelectedCategory(null);
        setSearchQuery("");
        setStep("browse");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-lg">
                <AnimatePresence mode="wait">
                    {/* Step 1: List current prompts */}
                    {step === "list" && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-1 flex-col overflow-hidden"
                        >
                            <DialogHeader className="border-b border-border px-6 py-4">
                                <DialogTitle className="text-center">My Prompts</DialogTitle>
                                <p className="text-center text-sm text-muted-foreground">
                                    {localPrompts.length}/{MAX_PROMPTS} prompts selected
                                </p>
                            </DialogHeader>

                            <div className="flex-1 space-y-3 overflow-y-auto p-6">
                                {localPrompts.map((prompt, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative rounded-2xl border border-border bg-card p-4"
                                    >
                                        <button
                                            onClick={() => handleDeletePrompt(index)}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditPrompt(index)}
                                            className="w-full text-left"
                                        >
                                            <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                                {prompt.question}
                                            </p>
                                            <p className="mt-2 text-base font-medium text-foreground">
                                                {prompt.answer}
                                            </p>
                                        </button>
                                    </motion.div>
                                ))}

                                {localPrompts.length < MAX_PROMPTS && (
                                    <motion.button
                                        onClick={handleAddNew}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span className="font-medium">Add a Prompt</span>
                                    </motion.button>
                                )}
                            </div>

                            <div className="border-t border-border px-6 py-4">
                                <button
                                    onClick={handleSaveAll}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background transition-opacity hover:opacity-90"
                                >
                                    <Check className="h-4 w-4" />
                                    Save Prompts
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Browse prompts */}
                    {step === "browse" && (
                        <motion.div
                            key="browse"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-1 flex-col overflow-hidden"
                        >
                            <DialogHeader className="border-b border-border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setStep("list")}
                                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <DialogTitle className="flex-1 text-center">Choose a Prompt</DialogTitle>
                                    <div className="w-8" />
                                </div>
                            </DialogHeader>

                            {/* Search */}
                            <div className="border-b border-border px-6 py-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search prompts..."
                                        className="w-full rounded-full border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex gap-2 overflow-x-auto border-b border-border px-6 py-3">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!selectedCategory
                                            ? "bg-foreground text-background"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    All
                                </button>
                                {PROMPT_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === cat.id
                                                ? "bg-foreground text-background"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <span>{cat.emoji}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Prompt list */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredPrompts.length > 0 ? (
                                    filteredPrompts.map((prompt) => (
                                        <button
                                            key={prompt.id}
                                            onClick={() => handleSelectPrompt(prompt)}
                                            className="flex w-full items-center gap-3 border-b border-border px-6 py-4 text-left transition-colors hover:bg-muted/50"
                                        >
                                            <span className="text-xl">{prompt.emoji}</span>
                                            <span className="flex-1 text-sm font-medium text-foreground">
                                                {prompt.question}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        No prompts found
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Answer the prompt */}
                    {step === "answer" && selectedPrompt && (
                        <motion.div
                            key="answer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-1 flex-col"
                        >
                            <DialogHeader className="border-b border-border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setStep(editingIndex !== null ? "list" : "browse");
                                            setEditingIndex(null);
                                        }}
                                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <DialogTitle className="flex-1 text-center">
                                        {editingIndex !== null ? "Edit Answer" : "Your Answer"}
                                    </DialogTitle>
                                    <div className="w-8" />
                                </div>
                            </DialogHeader>

                            <div className="flex-1 space-y-4 p-6">
                                <div className="rounded-2xl bg-primary/5 p-4">
                                    <p className="text-sm font-semibold text-primary">
                                        {selectedPrompt.question}
                                    </p>
                                </div>

                                <textarea
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value.slice(0, 250))}
                                    placeholder="Write your answer here..."
                                    className="min-h-[150px] w-full resize-none rounded-2xl border border-border bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                    autoFocus
                                />
                                <p className="text-right text-xs text-muted-foreground">
                                    {answerText.length}/250
                                </p>
                            </div>

                            <div className="border-t border-border px-6 py-4">
                                <button
                                    onClick={handleSaveAnswer}
                                    disabled={!answerText.trim()}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                                >
                                    <Check className="h-4 w-4" />
                                    {editingIndex !== null ? "Update Answer" : "Add to Profile"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default PromptPicker;
