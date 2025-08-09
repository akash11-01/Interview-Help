import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AlertConfirmationProps {
  children: React.ReactNode;
  stopInterview: () => void;
}

export default function AlertConformation({
  children,
  stopInterview,
}: AlertConfirmationProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End Interview?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to end your interview? This action cannot be
            undone and your interview session will be terminated immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => stopInterview()}
            className="bg-red-600 hover:bg-red-700"
          >
            End Interview
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
