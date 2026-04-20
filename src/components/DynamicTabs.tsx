import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TabContentView from "./TabContentView";
import LastUpdated from "./LastUpdated";
import { Plus, X } from "lucide-react";

const logTabActivity = (detail: string) => {
  supabase.from("activity_log").insert({ source: "tab", detail });
};

interface Tab {
  id: string;
  title: string;
  sort_order: number;
  is_default: boolean;
}

interface DynamicTabsProps {
  activeTab: string | null;
  onTabChange: (tabId: string | null, isDefault: boolean) => void;
}

const DynamicTabs = ({ activeTab, onTabChange }: DynamicTabsProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const { isAuthed } = useAuth();
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("tabs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) {
        const typedTabs = data as Tab[];
        setTabs(typedTabs);
        if (!activeTab && typedTabs.length > 0) {
          const def = typedTabs.find(t => t.is_default) || typedTabs[0];
          onTabChange(def.id, def.is_default);
        }
      }
    };
    fetch();
  }, []);

  const addTab = async () => {
    const maxOrder = tabs.length > 0 ? Math.max(...tabs.map(t => t.sort_order)) + 1 : 0;
    const { data } = await supabase
      .from("tabs")
      .insert({ title: "New Tab", sort_order: maxOrder, is_default: false })
      .select()
      .single();
    if (data) {
      const newTab = data as Tab;
      setTabs(prev => [...prev, newTab]);
      onTabChange(newTab.id, false);
      logTabActivity(`add:${newTab.id}`);
    }
  };

  const deleteTab = async (id: string) => {
    const tab = tabs.find(t => t.id === id);
    if (!tab || tab.is_default) return;
    await supabase.from("tabs").delete().eq("id", id);
    setTabs(prev => prev.filter(t => t.id !== id));
    logTabActivity(`delete:${id}`);
    if (activeTab === id) {
      const def = tabs.find(t => t.is_default);
      onTabChange(def?.id || null, true);
    }
  };

  const startRename = (tab: Tab) => {
    setEditingTitle(tab.id);
    setTitleInput(tab.title);
  };

  const saveRename = async (id: string) => {
    if (!titleInput.trim()) return;
    await supabase.from("tabs").update({ title: titleInput.trim() }).eq("id", id);
    setTabs(prev => prev.map(t => t.id === id ? { ...t, title: titleInput.trim() } : t));
    setEditingTitle(null);
    logTabActivity(`rename:${id}`);
  };

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOver.current = idx;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) {
      dragItem.current = null;
      dragOver.current = null;
      return;
    }
    const newTabs = [...tabs];
    const dragged = newTabs.splice(dragItem.current, 1)[0];
    newTabs.splice(dragOver.current, 0, dragged);
    const updated = newTabs.map((t, i) => ({ ...t, sort_order: i }));
    setTabs(updated);
    dragItem.current = null;
    dragOver.current = null;
    await Promise.all(
      updated.map(t =>
        supabase.from("tabs").update({ sort_order: t.sort_order }).eq("id", t.id)
      )
    );
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            className="flex items-center group"
            draggable={isAuthed && editingTitle !== tab.id}
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            {editingTitle === tab.id ? (
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => saveRename(tab.id)}
                onKeyDown={(e) => e.key === "Enter" && saveRename(tab.id)}
                autoFocus
                className="px-4 py-2 text-sm bg-transparent border-b-2 border-primary text-foreground focus:outline-none font-mc"
              />
            ) : (
              <button
                onClick={() => onTabChange(tab.id, tab.is_default)}
                onDoubleClick={() => isAuthed && !tab.is_default && startRename(tab)}
                className={`px-4 py-2 text-sm transition-colors border-b-2 font-mc whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                } ${isAuthed ? "cursor-grab active:cursor-grabbing" : ""}`}
              >
                {tab.title}
              </button>
            )}
            {isAuthed && !tab.is_default && (
              <button
                onClick={() => deleteTab(tab.id)}
                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity -ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {isAuthed && (
          <button
            onClick={addTab}
            className="px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
            title="Add tab"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tab content - only for non-default tabs (default renders commands) */}
      {currentTab && !currentTab.is_default && (
        <TabContentView tabId={currentTab.id} />
      )}
    </div>
  );
};

export default DynamicTabs;
