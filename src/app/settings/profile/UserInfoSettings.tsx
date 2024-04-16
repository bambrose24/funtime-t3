"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";
import { FuntimeAvatarFallback } from "~/app/_nav/AvatarFallback";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { clientApi } from "~/trpc/react";
import { type serverApi } from "~/trpc/server";
import { updateUsernameSchema } from "~/utils/schemas/updateUsername";

type Props = {
  data: Awaited<ReturnType<typeof serverApi.settings.get>>;
};

export function UserInfoSettings(props: Props) {
  return (
    <div className="grid w-full grid-cols-1 flex-row justify-between md:grid-cols-2">
      <UsernameForm {...props} />
      <AvatarForm {...props} />
    </div>
  );
}

type UsernameForm = z.infer<typeof updateUsernameSchema>;

function UsernameForm({ data }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UsernameForm>({
    resolver: zodResolver(updateUsernameSchema),
    values: {
      username: data.dbUser?.username ?? "",
    },
    shouldUseNativeValidation: false,
    reValidateMode: "onChange",
  });

  const router = useRouter();

  const { mutateAsync: updateUsername } =
    clientApi.settings.updateUsername.useMutation({
      onSuccess: () => {
        toast.success(
          `Successfully updated your username. It will take up to an hour to see the change reflected.`,
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onSubmit = async (data: UsernameForm) => {
    await updateUsername(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col gap-3">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register("username")} />
        {errors.username && (
          <Text.Small>
            Only numbers and letters allowed. Must be between 8 and 30
            characters.
          </Text.Small>
        )}
        <Button
          loading={isSubmitting}
          disabled={isSubmitting || Boolean(errors.username) || !isDirty}
        >
          Update Username
        </Button>
      </div>
    </form>
  );
}

function AvatarForm({ data }: Props) {
  return (
    <div className="flex w-full flex-col items-end">
      <Avatar className="h-16 w-16 lg:h-32 lg:w-32">
        <FuntimeAvatarFallback username={data.dbUser?.username ?? ""} />
      </Avatar>
    </div>
  );
}
