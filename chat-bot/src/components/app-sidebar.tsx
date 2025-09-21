"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import axios from "axios";
import { X } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Profile from "./Profile";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import "dotenv/config";

interface AppSidebarProps {
  chats: any[];
  onChatSelect: (chatId: number) => void;
  currentChatId: number | null;
  onChatDeleted?: () => void;
  onCurrentChatDeleted?: () => void;
}

export function AppSidebar({
  chats,
  onChatSelect,
  currentChatId,
  onChatDeleted,
  onCurrentChatDeleted,
}: AppSidebarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const handleDeleteChats = async (chatId: number) => {
    try {
      const res = await fetch(`/api/v1/chats/${chatId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to delete chat:", errorData);
        return;
      }
      const result = await res.json();
      console.log(`Successfully deleted chat ${chatId}:`, result);
      
      if (onChatDeleted) {
        onChatDeleted();
      }
      
      if (currentChatId === chatId && onCurrentChatDeleted) {
        onCurrentChatDeleted();
      }
      
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setDialogOpen(false);
      setSelectedChatId(null);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="px-2 py-2">
            <h2 className="text-lg font-semibold">Chat History</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No chats yet
                    </div>
                  </SidebarMenuItem>
                ) : (
                  chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => onChatSelect(chat.id)}
                        isActive={currentChatId === chat.id}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="truncate">
                            {chat.title || `Chat ${chat.id}`}
                          </div>
                          <div
                            className="ml-2 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChatId(chat.id);
                              setDialogOpen(true);
                            }}
                          >
                            <X size={16} />
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Profile />
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setDialogOpen(false);
                setSelectedChatId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                if (selectedChatId !== null) {
                  handleDeleteChats(selectedChatId);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
