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
import { type RouterOutputs } from "~/trpc/types";
import { updateUsernameSchema } from "~/utils/schemas/updateUsername";

type Props = {
  data: RouterOutputs["settings"]["get"];
};

export function UserInfoSettings(props: Props) {
  const { data } = clientApi.settings.get.useQuery(undefined, {
    initialData: props.data,
  });
  return (
    <div className="grid w-full grid-cols-5 flex-row justify-between gap-2">
      <UsernameForm data={data} />
      <AvatarForm data={data} />
    </div>
  );
}

type UsernameFormType = z.infer<typeof updateUsernameSchema>;

function UsernameForm({ data }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UsernameFormType>({
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
          `Successfully updated your username. It may take 15 minutes to see the change reflected.`,
        );
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onSubmit = async (data: UsernameFormType) => {
    await updateUsername(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="col-span-3">
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
          variant="secondary"
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
    <div className="col-span-2 flex w-full flex-col items-center">
      <Avatar className="h-16 w-16 lg:h-32 lg:w-32">
        <FuntimeAvatarFallback username={data.dbUser?.username ?? ""} />
      </Avatar>
    </div>
  );
}
