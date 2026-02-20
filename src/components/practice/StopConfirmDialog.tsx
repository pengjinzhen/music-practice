import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  onSave: () => void
  onRestart: () => void
  onDiscard: () => void
}

export function StopConfirmDialog({ open, onClose, onSubmit, onSave, onRestart, onDiscard }: Props) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('practice.stop_confirm_title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button onClick={onSubmit}>{t('practice.stop_submit')}</Button>
          <Button variant="outline" onClick={onSave}>{t('practice.stop_save')}</Button>
          <Button variant="outline" onClick={onRestart}>{t('practice.stop_restart')}</Button>
          <Button variant="ghost" onClick={onDiscard}>{t('practice.stop_discard')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
