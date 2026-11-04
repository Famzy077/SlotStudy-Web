import { useState } from 'react';
import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';
import { PageTitle } from '../../../components/common';

const FAQS = [
  [
    'How does the study buddy know what to answer?',
    'The study buddy is grounded in the materials you select for a session. It uses those notes to help answer your questions, rather than relying on general answers alone.',
  ],
  [
    'What file types can I upload?',
    'You can upload PDF, PNG and JPG files up to 50 MB.',
  ],
  [
    'Can I ask questions in Nigerian Pidgin?',
    'Yes. Ask in Nigerian Pidgin or English, or use one of the prompt suggestions in a study-room conversation.',
  ],
  [
    'What happens to my study materials?',
    'Materials are linked to your personal study account and used to support your learning features.',
  ],
];

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="narrow-page">
      <PageTitle
        eyebrow="HERE WHEN YOU NEED A HAND"
        title="Help & support"
        subtitle="A few answers to help you get more from your study space."
      />

      <div className="faq-card">
        {FAQS.map(([question, answer], index) => (
          <div className="faq-item" key={question}>
            <button onClick={() => setOpen(open === index ? null : index)}>
              <b>{question}</b>
              <ChevronDown className={open === index ? 'faq-open' : ''} size={17} />
            </button>
            {open === index && <p>{answer}</p>}
          </div>
        ))}
      </div>

      <div className="support-card">
        <span><MessageCircle size={19} /></span>
        <div>
          <b>Still need a hand?</b>
          <p>We’d love to hear from you.</p>
        </div>
        <a className="button button-outline" href="mailto:support@slotstudy.app">
          Email support <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}
