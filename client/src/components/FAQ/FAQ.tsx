import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./FAQ.css";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How do I create a help request?",
    answer:
      "To create a help request, simply click on the 'Create Request' button, fill out the form with your details, and submit. Make sure to provide clear information about what kind of help you need.",
  },
  {
    id: 2,
    question: "What types of help can I request?",
    answer:
      "You can request various types of help including financial assistance, medical support, educational aid, and other forms of support. Each request is reviewed to ensure it meets our guidelines.",
  },
  {
    id: 3,
    question: "How do I know if my request is legitimate?",
    answer:
      "All requests go through a verification process. We check the provided information and may request additional documentation to ensure the legitimacy of each request.",
  },
  {
    id: 4,
    question: "Can I help others on the platform?",
    answer:
      "Yes! You can browse through requests and choose to help those in need. You can provide financial assistance, resources, or other forms of support based on your capacity.",
  },
  {
    id: 5,
    question: "Is my information secure?",
    answer:
      "We take your privacy seriously. All personal information is encrypted and stored securely. We never share your details with third parties without your consent.",
  },
];

const FAQ = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Find answers to common questions about our platform
        </p>
      </motion.div>

      <div className="mt-12 space-y-4">
        {faqData.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="faq-item overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="faq-button flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none"
            >
              <span className="text-lg font-medium text-gray-900">
                {faq.question}
              </span>
              <motion.span
                className="chevron-icon"
                animate={{ rotate: openId === faq.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {openId === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </motion.span>
            </button>

            <AnimatePresence>
              {openId === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="faq-content overflow-hidden"
                >
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-gray-600">
          Still have questions?{" "}
          <a
            href="/contact"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Contact our support team
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default FAQ;
