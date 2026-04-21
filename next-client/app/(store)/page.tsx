"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useToast } from "@/hooks/useToast";

const Page = () => {
  const toast = useToast();
  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => toast.success("Success!", "This is a success message.")}
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.error("Error!", "This is an error message.")}
      >
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.info("Info!", "This is an info message.")}
      >
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.warning("Warning!", "This is a warning message.")
        }
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.loading("Loading...", "This is a loading message.",)
        }
      >
        Loading
      </Button>
      <Input className="w-60" />
      <Textarea variant="filled" />
      <ThemeToggle />
    </div>
  );
};

export default Page;
