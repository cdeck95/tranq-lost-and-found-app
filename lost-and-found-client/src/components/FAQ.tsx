import React, { useState } from 'react';
import '../styles/FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQ() {
  const [expanded, setExpanded] = useState<boolean[]>(Array(FAQData.length).fill(false));

  const toggleAnswer = (index: number) => {
    setExpanded((prev) =>
      prev.map((value, i) => (i === index ? !value : false))
    );
  };

  return (
    <div className="faq-page">
      <h1>Frequently Asked Questions</h1>

      {FAQData.map((item, index) => (
        <div className="faq-section" key={index}>
          <div className="question-container" onClick={() => toggleAnswer(index)}>
            <h2 className="question">{item.question}</h2>
            {/* <button
              className={`expand-button ${expanded[index] ? 'expanded' : 'collapsed'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleAnswer(index);
              }}
            >
              {expanded[index] ? '▲' : '▼'}
            </button> */}
          </div>
          {expanded[index] && <p className="answer">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}

const FAQData: FAQItem[] = [
  {
    question: 'How does a disc appear in the inventory?',
    answer:
      'Discs are added to the inventory by administrators or staff members. When they find a disc on a disc golf course, they enter the relevant information into the system, including the course, name, disc type, and other details. This makes the disc visible in the inventory.',
  },
  {
    question: 'Can I report my disc as lost?',
    answer:
      'At the moment, only administrators have the ability to add discs to the inventory. Self-reporting lost discs is not available. If you believe your disc is lost, it\'s advisable to check the inventory through the app or contact the course staff to inquire if it has been found.',
  },
  {
    question: 'How do I see if my disc is in the inventory?',
    answer:
      'To check if your disc is in the inventory, navigate to the app\'s inventory page. You can search for your disc by name, course, or other identifying information. If your disc has been found and reported by an administrator, it will appear in the search results.',
  },
  {
    question: 'What does the pickup deadline mean? Will I lose my ability to claim my disc?',
    answer:
      'The pickup deadline is the date by which you should retrieve your disc from the inventory. After this date, the disc may be marked as "For Sale in $5 Bin," and you may lose the ability to claim it. It\'s essential to check the pickup deadline for your disc and take action accordingly.',
  },
  {
    question: 'How do I pick up my disc?',
    answer:
      'To pick up your disc, contact one of our volunteers via text to coordinate a time to retrieve it. You can reach out to Steve Finger @ 609-280-7999 or Dan Kelly @ 856-628-1436. Alternatively, a decision could be made to leave the disc in a lockbox and provide you with the access code for your convenience, if this is preferred.',
  },
];

export default FAQ;
