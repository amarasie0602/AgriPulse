import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
export function FieldOverview({name}:{name:string}) {
  const now=new Date(), greeting=now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':'Good evening'
  return <header className="operational-welcome"><div><p className="eyebrow">{now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p><h1>{greeting}, {name}</h1><p>Your farms, resource records, and environmental estimates.</p></div><Link className="button primary" to="/resources#resource-entry">Record resource use <ArrowRight size={16} aria-hidden="true" /></Link></header>
}
