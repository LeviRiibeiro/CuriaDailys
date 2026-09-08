'use client';

import { BookOpen, CalendarDays, Check, Dumbbell, Heart, Home, MoreHorizontal, Plus, Repeat2, Sparkles, Sunrise, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Activity = { id: number; title: string; time: string; kind: 'Rotina' | 'Pontual'; category: string; done: boolean; icon: 'water' | 'move' | 'study' | 'heart' | 'book' };

const initialActivities: Activity[] = [
  { id: 1, title: 'Beber água', time: '07:00', kind: 'Rotina', category: 'Bem-estar', done: true, icon: 'water' },
  { id: 2, title: 'Exercício físico', time: '08:00', kind: 'Rotina', category: 'Saúde', done: false, icon: 'move' },
  { id: 3, title: 'Estudar', time: '10:00', kind: 'Rotina', category: 'Crescimento', done: false, icon: 'study' },
  { id: 4, title: 'Reunião do projeto', time: '14:00', kind: 'Pontual', category: 'Trabalho', done: false, icon: 'heart' },
  { id: 5, title: 'Ler um capítulo', time: '21:00', kind: 'Rotina', category: 'Pausa', done: false, icon: 'book' },
];
const week = [['Seg', '26'], ['Ter', '27'], ['Qua', '28'], ['Qui', '29'], ['Sex', '30'], ['Sáb', '31'], ['Dom', '1']];

function ActivityIcon({ kind }: { kind: Activity['icon'] }) {
  const shared = { size: 18, strokeWidth: 1.8 };
  if (kind === 'move') return <Dumbbell {...shared} />;
  if (kind === 'study') return <BookOpen {...shared} />;
  if (kind === 'heart') return <Heart {...shared} />;
  if (kind === 'book') return <Sparkles {...shared} />;
  return <span className="text-base leading-none">💧</span>;
}

export default function HomePage() {
  const [activities, setActivities] = useState(initialActivities);
  const [filter, setFilter] = useState<'Todas' | 'Rotina' | 'Pontual'>('Todas');
  const [selectedDay, setSelectedDay] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [kind, setKind] = useState<'Rotina' | 'Pontual'>('Rotina');
  const [category, setCategory] = useState('Bem-estar');
  const [notice, setNotice] = useState('');
  const visibleActivities = useMemo(() => activities.filter((activity) => filter === 'Todas' || activity.kind === filter), [activities, filter]);
  const doneCount = activities.filter((activity) => activity.done).length;

  function toggleActivity(id: number) { setActivities((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item)); }
  function addActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setActivities((current) => [...current, { id: Date.now(), title: title.trim(), time, kind, category, done: false, icon: kind === 'Pontual' ? 'heart' : 'book' }].sort((a, b) => a.time.localeCompare(b.time)));
    setTitle(''); setComposerOpen(false); setNotice('Pronto! Sua atividade entrou na agenda.'); window.setTimeout(() => setNotice(''), 3200);
  }

  return <main className="min-h-screen bg-[#fff5f1] px-3 py-4 font-sans text-[#442c28] sm:px-6 sm:py-8">
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[440px] flex-col overflow-hidden rounded-[2.4rem] border border-white/80 bg-[#fffaf8] shadow-[0_24px_70px_rgba(112,57,33,0.18)] sm:min-h-[780px]">
      <header className="px-6 pb-3 pt-5"><div className="mb-7 flex items-center justify-between text-xs font-semibold text-[#432e29]"><span>9:41</span><div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-current" /><span className="h-2 w-2 rounded-full bg-current" /><span className="h-2 w-5 rounded-sm border border-current" /></div></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffdfd7] text-[#f46b31]"><Sunrise size={23} strokeWidth={1.8} /></span><h1 className="font-serif text-[1.65rem] tracking-tight">Meu dia</h1></div><button onClick={() => setComposerOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f56b30] text-white shadow-[0_8px_15px_rgba(245,107,48,0.25)] transition hover:scale-105" aria-label="Adicionar atividade"><Plus size={23} /></button></div></header>
      <section className="px-6 pb-4"><p className="text-sm text-[#8e6f66]">Segunda-feira, 26 de Maio</p><h2 className="mt-1 max-w-[270px] font-serif text-[1.5rem] leading-[1.15]">Hoje é um novo dia para cuidar do que importa.</h2><div className="mt-5 grid grid-cols-7 rounded-[1.35rem] bg-[#fff4ef] px-1 py-2">{week.map(([day, number], index) => <button key={day} onClick={() => setSelectedDay(index)} className="flex flex-col items-center gap-1 text-xs font-medium text-[#8a716b]" aria-label={`${day}, ${number}`}><span>{day}</span><span className={`grid h-9 w-9 place-items-center rounded-xl transition ${selectedDay === index ? 'bg-[#f56b30] text-white shadow-sm' : 'text-[#47312c]'}`}>{number}</span></button>)}</div></section>
      <section className="flex-1 px-6 pb-24"><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{(['Todas', 'Rotina', 'Pontual'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === item ? 'bg-[#f56b30] text-white shadow-sm' : 'bg-[#fff3ef] text-[#825e55]'}`}>{item === 'Todas' ? 'Todas' : item === 'Rotina' ? '↻ Rotina' : '◷ Pontuais'}</button>)}</div><div className="mb-3 flex items-end justify-between"><p className="text-sm font-semibold">Sua agenda</p><p className="text-xs text-[#a27f75]">{doneCount} de {activities.length} concluídas</p></div><div className="space-y-2.5">{visibleActivities.map((activity) => <article key={activity.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${activity.done ? 'border-[#f4c7b7] bg-[#fff4ef]' : 'border-[#f1ded7] bg-white'}`}><button onClick={() => toggleActivity(activity.id)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${activity.done ? 'border-[#f56b30] bg-[#f56b30] text-white' : 'border-[#f3a182] text-[#f56b30] hover:bg-[#fff0eb]'}`} aria-label={`Marcar ${activity.title} como ${activity.done ? 'pendente' : 'concluída'}`}>{activity.done ? <Check size={20} strokeWidth={2.3} /> : <ActivityIcon kind={activity.icon} />}</button><div className="min-w-0 flex-1"><h3 className={`truncate text-[0.95rem] font-semibold ${activity.done ? 'text-[#946c61] line-through' : ''}`}>{activity.title}</h3><div className="mt-0.5 flex items-center gap-2 text-xs text-[#967971]"><span>{activity.time}</span><span className="flex items-center gap-1"><Repeat2 size={12} /> {activity.kind}</span></div></div><button className="p-1 text-[#97766c]" aria-label={`Mais opções para ${activity.title}`}><MoreHorizontal size={20} /></button></article>)}</div></section>
      <nav className="sticky bottom-0 flex items-center justify-around border-t border-[#f0ddd6] bg-[#fffaf8]/95 px-4 py-3 backdrop-blur" aria-label="Navegação principal"><button className="flex flex-col items-center gap-1 text-xs font-semibold text-[#f56b30]"><Home size={20} fill="currentColor" />Início</button><button className="flex flex-col items-center gap-1 text-xs text-[#99766b]"><CalendarDays size={20} />Agenda</button><button onClick={() => setComposerOpen(true)} className="-mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-[#fffaf8] bg-[#f56b30] text-white shadow-lg" aria-label="Adicionar atividade"><Plus size={26} /></button><button className="flex flex-col items-center gap-1 text-xs text-[#99766b]"><Repeat2 size={20} />Rotina</button><button className="flex flex-col items-center gap-1 text-xs text-[#99766b]"><Heart size={20} />Você</button></nav>
    </div>
    {notice && <div role="status" className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-[#442c28] px-5 py-3 text-sm font-medium text-white shadow-xl">{notice}</div>}
    {composerOpen && <div className="fixed inset-0 z-40 flex items-end bg-[#3d231b]/25 p-3 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="activity-title"><form onSubmit={addActivity} className="w-full max-w-[440px] rounded-[2rem] bg-[#fffaf8] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-[#94766b]">Seu tempo, do seu jeito</p><h2 id="activity-title" className="font-serif text-2xl">Nova atividade</h2></div><button type="button" onClick={() => setComposerOpen(false)} className="rounded-full p-2 text-[#78564d] hover:bg-[#fff0eb]" aria-label="Fechar"><X /></button></div><label className="mb-4 block text-sm font-semibold">Título da atividade<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Caminhar, estudar, ligar para mãe" className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-4 py-3 text-base font-normal outline-none placeholder:text-[#b8a099] focus:border-[#f56b30]" /></label><div className="mb-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Horário<input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#f56b30]" /></label><label className="text-sm font-semibold">Categoria<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#f56b30]"><option>Bem-estar</option><option>Saúde</option><option>Trabalho</option><option>Crescimento</option><option>Pausa</option></select></label></div><fieldset className="mb-6"><legend className="mb-2 text-sm font-semibold">Tipo de atividade</legend><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setKind('Rotina')} className={`rounded-xl border p-3 text-left text-sm transition ${kind === 'Rotina' ? 'border-[#f56b30] bg-[#fff0eb] text-[#a84720]' : 'border-[#ead5ce] bg-white'}`}><Repeat2 size={18} /><strong className="mt-1 block">Rotina</strong><span className="text-xs">Se repete</span></button><button type="button" onClick={() => setKind('Pontual')} className={`rounded-xl border p-3 text-left text-sm transition ${kind === 'Pontual' ? 'border-[#f56b30] bg-[#fff0eb] text-[#a84720]' : 'border-[#ead5ce] bg-white'}`}><CalendarDays size={18} /><strong className="mt-1 block">Pontual</strong><span className="text-xs">Data única</span></button></div></fieldset><button type="submit" className="w-full rounded-2xl bg-[#f56b30] py-3.5 text-sm font-bold text-white shadow-[0_8px_15px_rgba(245,107,48,0.25)]">Salvar atividade</button></form></div>}
  </main>;
}
