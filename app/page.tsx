'use client';

import { BookOpen, CalendarDays, Check, Dumbbell, Heart, Home, LogOut, MoreHorizontal, Plus, Repeat2, Sparkles, Sunrise, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Activity = { id: string; title: string; time: string; kind: 'Rotina' | 'Pontual'; category: string; done: boolean; completionId?: string; icon: 'water' | 'move' | 'study' | 'heart' | 'book' };
type StoredActivity = { id: string; title: string; scheduled_time: string; activity_type: string; category: string };
const week = [['Seg', '26'], ['Ter', '27'], ['Qua', '28'], ['Qui', '29'], ['Sex', '30'], ['Sáb', '31'], ['Dom', '1']];

function today() { return new Date().toISOString().slice(0, 10); }
function activityIcon(title: string, category: string): Activity['icon'] {
  const value = `${title} ${category}`.toLowerCase();
  if (value.includes('exerc') || value.includes('saúde')) return 'move';
  if (value.includes('estud') || value.includes('cresc')) return 'study';
  if (value.includes('ler') || value.includes('pausa')) return 'book';
  if (value.includes('água') || value.includes('bem-estar')) return 'water';
  return 'heart';
}
function ActivityIcon({ kind }: { kind: Activity['icon'] }) {
  const shared = { size: 18, strokeWidth: 1.8 };
  if (kind === 'move') return <Dumbbell {...shared} />;
  if (kind === 'study') return <BookOpen {...shared} />;
  if (kind === 'heart') return <Heart {...shared} />;
  if (kind === 'book') return <Sparkles {...shared} />;
  return <span className="text-base leading-none">💧</span>;
}

function AccessScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setWorking(true); setMessage('');
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email, password });
    setWorking(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (result.data.user && result.data.session) { onAuthenticated(result.data.user); return; }
    setMessage('Confira seu e-mail para confirmar a conta e depois entre por aqui.');
  }

  return <main className="min-h-screen bg-[#fff5f1] px-4 py-8 font-sans text-[#442c28] sm:grid sm:place-items-center"><section className="mx-auto max-w-[430px] rounded-[2.4rem] border border-white/80 bg-[#fffaf8] p-7 shadow-[0_24px_70px_rgba(112,57,33,0.18)]"><div className="mb-8 text-center"><span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[1.5rem] bg-[#ffdfd7] text-[#f56b30]"><Sunrise size={34} /></span><h1 className="font-serif text-4xl">Meu dia</h1><p className="mt-3 text-[1rem] leading-relaxed text-[#8e6f66]">Pequenas ações, grandes versões de você.</p></div><div className="mb-5 flex rounded-xl bg-[#fff0eb] p-1"><button onClick={() => setMode('signup')} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-[#d4511d] shadow-sm' : 'text-[#8e6f66]'}`}>Criar conta</button><button onClick={() => setMode('signin')} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mode === 'signin' ? 'bg-white text-[#d4511d] shadow-sm' : 'text-[#8e6f66]'}`}>Entrar</button></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">E-mail<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-4 py-3 font-normal outline-none focus:border-[#f56b30]" /></label><label className="block text-sm font-semibold">Senha<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Pelo menos 6 caracteres" className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-4 py-3 font-normal outline-none focus:border-[#f56b30]" /></label>{message && <p role="status" className="rounded-xl bg-[#fff0eb] px-3 py-2 text-sm text-[#99573f]">{message}</p>}<button disabled={working} className="w-full rounded-2xl bg-[#f56b30] py-3.5 text-sm font-bold text-white shadow-[0_8px_15px_rgba(245,107,48,0.25)] disabled:opacity-60">{working ? 'Um instante...' : mode === 'signup' ? 'Começar com carinho' : 'Entrar na agenda'}</button></form></section></main>;
}

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'Todas' | 'Rotina' | 'Pontual'>('Todas');
  const [selectedDay, setSelectedDay] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState(''); const [time, setTime] = useState('09:00');
  const [kind, setKind] = useState<'Rotina' | 'Pontual'>('Rotina'); const [category, setCategory] = useState('Bem-estar');
  const [date, setDate] = useState(today()); const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false); const [saving, setSaving] = useState(false); const [notice, setNotice] = useState('');
  const visibleActivities = useMemo(() => activities.filter((activity) => filter === 'Todas' || activity.kind === filter), [activities, filter]);
  const doneCount = activities.filter((activity) => activity.done).length;
  function showNotice(text: string) { setNotice(text); window.setTimeout(() => setNotice(''), 3600); }

  async function loadActivities() {
    if (!supabase) return;
    const [activityResult, completionResult] = await Promise.all([
      supabase.from('activities').select('id, title, scheduled_time, activity_type, category').eq('is_archived', false).or(`scheduled_date.is.null,scheduled_date.eq.${today()}`).order('scheduled_time'),
      supabase.from('activity_completions').select('id, activity_id').eq('occurrence_date', today()),
    ]);
    if (activityResult.error) { showNotice('Não foi possível carregar sua agenda.'); return; }
    const completions = new Map((completionResult.data ?? []).map((item) => [item.activity_id, item.id]));
    setActivities(((activityResult.data ?? []) as StoredActivity[]).map((item) => ({ id: item.id, title: item.title, time: item.scheduled_time.slice(0, 5), kind: item.activity_type === 'one_time' ? 'Pontual' : 'Rotina', category: item.category, done: completions.has(item.id), completionId: completions.get(item.id), icon: activityIcon(item.title, item.category) })));
  }

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (!mounted) return; setUser(data.session?.user ?? null); setReady(true); if (data.session?.user) void loadActivities(); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (!mounted) return; setUser(session?.user ?? null); if (session?.user) void loadActivities(); else setActivities([]); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function toggleActivity(activity: Activity) {
    if (!supabase) return;
    if (activity.done && activity.completionId) {
      const { error } = await supabase.from('activity_completions').delete().eq('id', activity.completionId);
      if (error) { showNotice('Não foi possível atualizar esta atividade.'); return; }
    } else {
      const { error } = await supabase.from('activity_completions').insert({ activity_id: activity.id, occurrence_date: today() });
      if (error) { showNotice('Não foi possível atualizar esta atividade.'); return; }
    }
    await loadActivities();
  }
  async function addActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('activities').insert({ title: title.trim(), scheduled_time: time, activity_type: kind === 'Rotina' ? 'routine' : 'one_time', frequency: kind === 'Rotina' ? 'daily' : 'once', scheduled_date: kind === 'Pontual' ? date : null, category });
    setSaving(false);
    if (error) { showNotice('Não foi possível salvar. Tente novamente.'); return; }
    setTitle(''); setComposerOpen(false); await loadActivities(); showNotice('Pronto! Sua atividade entrou na agenda.');
  }
  async function signOut() { if (supabase) await supabase.auth.signOut(); }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#fff5f1] font-serif text-2xl text-[#8e6f66]">Preparando seu dia...</main>;
  if (!supabase) return <main className="grid min-h-screen place-items-center bg-[#fff5f1] p-6 text-center font-sans text-[#442c28]"><div><Sunrise className="mx-auto mb-4 text-[#f56b30]" size={42} /><h1 className="font-serif text-3xl">Quase lá</h1><p className="mt-2 text-[#8e6f66]">A conexão segura da agenda ainda está sendo configurada.</p></div></main>;
  if (!user) return <AccessScreen onAuthenticated={(newUser) => { setUser(newUser); void loadActivities(); }} />;

  return <main className="min-h-screen bg-[#fff5f1] px-3 py-4 font-sans text-[#442c28] sm:px-6 sm:py-8"><div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[440px] flex-col overflow-hidden rounded-[2.4rem] border border-white/80 bg-[#fffaf8] shadow-[0_24px_70px_rgba(112,57,33,0.18)] sm:min-h-[780px]">
    <header className="px-6 pb-3 pt-5"><div className="mb-7 flex items-center justify-between text-xs font-semibold text-[#432e29]"><span>9:41</span><span className="max-w-[190px] truncate text-[#99766b]">{user.email}</span></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ffdfd7] text-[#f46b31]"><Sunrise size={23} strokeWidth={1.8} /></span><h1 className="font-serif text-[1.65rem] tracking-tight">Meu dia</h1></div><div className="flex gap-1"><button onClick={() => void signOut()} className="grid h-11 w-9 place-items-center text-[#936f65]" aria-label="Sair"><LogOut size={18} /></button><button onClick={() => setComposerOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f56b30] text-white shadow-[0_8px_15px_rgba(245,107,48,0.25)] transition hover:scale-105" aria-label="Adicionar atividade"><Plus size={23} /></button></div></div></header>
    <section className="px-6 pb-4"><p className="text-sm text-[#8e6f66]">Segunda-feira, 26 de Maio</p><h2 className="mt-1 max-w-[270px] font-serif text-[1.5rem] leading-[1.15]">Hoje é um novo dia para cuidar do que importa.</h2><div className="mt-5 grid grid-cols-7 rounded-[1.35rem] bg-[#fff4ef] px-1 py-2">{week.map(([day, number], index) => <button key={day} onClick={() => setSelectedDay(index)} className="flex flex-col items-center gap-1 text-xs font-medium text-[#8a716b]" aria-label={`${day}, ${number}`}><span>{day}</span><span className={`grid h-9 w-9 place-items-center rounded-xl transition ${selectedDay === index ? 'bg-[#f56b30] text-white shadow-sm' : 'text-[#47312c]'}`}>{number}</span></button>)}</div></section>
    <section className="flex-1 px-6 pb-24"><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{(['Todas', 'Rotina', 'Pontual'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === item ? 'bg-[#f56b30] text-white shadow-sm' : 'bg-[#fff3ef] text-[#825e55]'}`}>{item === 'Todas' ? 'Todas' : item === 'Rotina' ? '↻ Rotina' : '◷ Pontuais'}</button>)}</div><div className="mb-3 flex items-end justify-between"><p className="text-sm font-semibold">Sua agenda</p><p className="text-xs text-[#a27f75]">{doneCount} de {activities.length} concluídas</p></div>{visibleActivities.length === 0 ? <div className="rounded-2xl border border-dashed border-[#efcfc4] bg-[#fff7f4] px-5 py-9 text-center"><Sparkles className="mx-auto mb-3 text-[#f56b30]" /><h3 className="font-serif text-xl">Comece por algo pequeno</h3><p className="mt-2 text-sm leading-relaxed text-[#94766b]">Que cuidado você quer reservar para si hoje?</p><button onClick={() => setComposerOpen(true)} className="mt-4 text-sm font-bold text-[#d4511d]">Adicionar primeira atividade</button></div> : <div className="space-y-2.5">{visibleActivities.map((activity) => <article key={activity.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${activity.done ? 'border-[#f4c7b7] bg-[#fff4ef]' : 'border-[#f1ded7] bg-white'}`}><button onClick={() => void toggleActivity(activity)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${activity.done ? 'border-[#f56b30] bg-[#f56b30] text-white' : 'border-[#f3a182] text-[#f56b30] hover:bg-[#fff0eb]'}`} aria-label={`Marcar ${activity.title} como ${activity.done ? 'pendente' : 'concluída'}`}>{activity.done ? <Check size={20} strokeWidth={2.3} /> : <ActivityIcon kind={activity.icon} />}</button><div className="min-w-0 flex-1"><h3 className={`truncate text-[0.95rem] font-semibold ${activity.done ? 'text-[#946c61] line-through' : ''}`}>{activity.title}</h3><div className="mt-0.5 flex items-center gap-2 text-xs text-[#967971]"><span>{activity.time}</span><span className="flex items-center gap-1"><Repeat2 size={12} /> {activity.kind}</span></div></div><button className="p-1 text-[#97766c]" aria-label={`Mais opções para ${activity.title}`}><MoreHorizontal size={20} /></button></article>)}</div>}</section>
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-[#f0ddd6] bg-[#fffaf8]/95 px-4 py-3 backdrop-blur" aria-label="Navegação principal"><button className="flex flex-col items-center gap-1 text-xs font-semibold text-[#f56b30]"><Home size={20} fill="currentColor" />Início</button><button className="flex flex-col items-center gap-1 text-xs text-[#99766b]"><CalendarDays size={20} />Agenda</button><button onClick={() => setComposerOpen(true)} className="-mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-[#fffaf8] bg-[#f56b30] text-white shadow-lg" aria-label="Adicionar atividade"><Plus size={26} /></button><button className="flex flex-col items-center gap-1 text-xs text-[#99766b]"><Repeat2 size={20} />Rotina</button><button className="flex flex-col items-center gap-1 text-xs text-[#99766b]"><Heart size={20} />Você</button></nav>
  </div>
  {notice && <div role="status" className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-[#442c28] px-5 py-3 text-sm font-medium text-white shadow-xl">{notice}</div>}
  {composerOpen && <div className="fixed inset-0 z-40 flex items-end bg-[#3d231b]/25 p-3 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="activity-title"><form onSubmit={addActivity} className="w-full max-w-[440px] rounded-[2rem] bg-[#fffaf8] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-[#94766b]">Seu tempo, do seu jeito</p><h2 id="activity-title" className="font-serif text-2xl">Nova atividade</h2></div><button type="button" onClick={() => setComposerOpen(false)} className="rounded-full p-2 text-[#78564d] hover:bg-[#fff0eb]" aria-label="Fechar"><X /></button></div><label className="mb-4 block text-sm font-semibold">Título da atividade<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Caminhar, estudar, ligar para mãe" className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-4 py-3 text-base font-normal outline-none placeholder:text-[#b8a099] focus:border-[#f56b30]" /></label><div className="mb-4 grid grid-cols-2 gap-3"><label className="text-sm font-semibold">Horário<input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#f56b30]" /></label><label className="text-sm font-semibold">Categoria<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#f56b30]"><option>Bem-estar</option><option>Saúde</option><option>Trabalho</option><option>Crescimento</option><option>Pausa</option></select></label></div><fieldset className="mb-4"><legend className="mb-2 text-sm font-semibold">Tipo de atividade</legend><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setKind('Rotina')} className={`rounded-xl border p-3 text-left text-sm transition ${kind === 'Rotina' ? 'border-[#f56b30] bg-[#fff0eb] text-[#a84720]' : 'border-[#ead5ce] bg-white'}`}><Repeat2 size={18} /><strong className="mt-1 block">Rotina</strong><span className="text-xs">Se repete</span></button><button type="button" onClick={() => setKind('Pontual')} className={`rounded-xl border p-3 text-left text-sm transition ${kind === 'Pontual' ? 'border-[#f56b30] bg-[#fff0eb] text-[#a84720]' : 'border-[#ead5ce] bg-white'}`}><CalendarDays size={18} /><strong className="mt-1 block">Pontual</strong><span className="text-xs">Data única</span></button></div></fieldset>{kind === 'Pontual' && <label className="mb-5 block text-sm font-semibold">Data<input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ead5ce] bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#f56b30]" /></label>}<button disabled={saving} type="submit" className="w-full rounded-2xl bg-[#f56b30] py-3.5 text-sm font-bold text-white shadow-[0_8px_15px_rgba(245,107,48,0.25)] disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar atividade'}</button></form></div>}
  </main>;
}
