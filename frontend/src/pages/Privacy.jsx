import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const UPDATED = '10 November 2026';

const SECTIONS = [
  {
    title: 'What we collect',
    items: [
      'Your name, email address and the target role you pick.',
      'Your password, stored only as a one-way bcrypt hash. Nobody, including us, can read it.',
      'Your interviews: the questions you were asked, the answers you wrote, time spent, scores and feedback.',
      'Basic technical logs (time, page requested, status code) used to keep the service running. We do not log what you type.'
    ]
  },
  {
    title: 'How we use it',
    items: [
      'To sign you in and keep your account secure.',
      'To generate interview questions and grade your answers.',
      'To show your progress on the dashboard.',
      'To email you account messages: confirming your email, resetting your password, or telling you your password changed. No marketing.'
    ]
  },
  {
    title: 'Who else processes it',
    items: [
      'Our AI provider (Google Gemini or OpenRouter) receives each question and your answer to generate and grade them. Your name and email are never sent to it.',
      'Vercel hosts the website and API. MongoDB Atlas stores the database. Your email provider delivers account emails.',
      'We never sell your data or share it with advertisers. There are no ads and no third-party trackers.'
    ]
  },
  {
    title: 'Cookies',
    items: [
      'One cookie: a secure, HttpOnly session cookie that keeps you signed in. It expires after 7 days, or when you close the browser if you untick "Keep me signed in".',
      'Your browser also stores your name and email locally so the page can greet you, plus unsent answer drafts so you don\'t lose work. These never leave your device.'
    ]
  },
  {
    title: 'Your rights',
    items: [
      'Download everything we store about you from Account settings.',
      'Change your password, or sign out on every device, at any time.',
      'Delete your account from Account settings. This permanently removes your account, interviews and answers right away. Any backup copies are deleted within 30 days.'
    ]
  },
  {
    title: 'Keeping it safe',
    items: [
      'All traffic uses HTTPS. Passwords are hashed, sessions use secure cookies, and sign-in attempts are rate-limited.',
      'Database backups, when made, are encrypted and kept for no more than 30 days.'
    ]
  }
];

export default function Privacy() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Privacy policy</h1>
        <p className="mt-2 text-sm text-faint">Last updated {UPDATED}</p>
        <p className="mt-6 leading-relaxed text-muted">
          OfferForge AI is a mock-interview practice tool. This page explains, in plain language, what data we keep and what you can do about it.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map(section => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted marker:text-ember-400">
                {section.items.map(item => <li key={item}>{item}</li>)}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold">Questions</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Questions about your data? Open an issue on the project's{' '}
              <a href="https://github.com/LovjyotSingh/OfferForge-AI/issues" target="_blank" rel="noreferrer" className="text-ember-300 hover:text-ember-200">GitHub page</a>.
              Signed in? You can manage everything yourself in <Link to="/settings" className="text-ember-300 hover:text-ember-200">Account settings</Link>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
