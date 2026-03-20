import { redirect } from 'next/navigation';

export default function RegisterCodebtorPage() {
  redirect('/dashboard/treasury/codebtors/basic-info?openModal=true');
}
