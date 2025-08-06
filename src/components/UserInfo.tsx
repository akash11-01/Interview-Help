import { UserCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { Doc } from "../../convex/_generated/dataModel";

type User = Doc<"users">;

function UserInfo({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback>
          <UserCircleIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <span>{user.name}</span>
    </div>
  );
}
export default UserInfo;
