import { createClient } from '@/lib/supabase/server'
import { CompanyDialog } from './components/CompanyDialog'
import { DeleteCompanyButton } from './components/DeleteCompanyButton'
import { CompanyStatusSelect } from './components/CompanyStatusSelect'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function CompaniesPage() {
    const supabase = await createClient()

    // Find the companies this user is a member of
    const { data: members, error } = await supabase
        .from('company_members')
        .select('role, companies ( id, name, legal_name, cnpj, status, created_at )')

    const companiesData = members?.map(m => m.companies) || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
                    <p className="text-muted-foreground">
                        Gerencie as empresas que você representa.
                    </p>
                </div>
                <CompanyDialog />
            </div>

            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Razão Social</TableHead>
                            <TableHead>CNPJ</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cadastrada em</TableHead>
                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companiesData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhuma empresa cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            companiesData.map((company: any) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>{company.legal_name || '-'}</TableCell>
                                    <TableCell>{company.cnpj || '-'}</TableCell>
                                    <TableCell>
                                        <CompanyStatusSelect companyId={company.id} currentStatus={company.status || 'ativo'} />
                                    </TableCell>
                                    <TableCell>
                                        {company.created_at
                                            ? format(new Date(company.created_at), 'dd/MM/yyyy', { locale: ptBR })
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <CompanyDialog company={company} />
                                        <DeleteCompanyButton companyId={company.id} companyName={company.name} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
