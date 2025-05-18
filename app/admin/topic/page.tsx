"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Topic {
  id: string;
  name: string;
  version: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const fetchTopics = async () => {
    const res = await fetch("http://192.168.1.3:3000/api/topics");
    const data = await res.json();
    setTopics(data);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name,
      version: version ? parseInt(version) : 1,
    };

    const res = await fetch(
      editingTopic
        ? `http://192.168.1.3:3000/api/topics/${editingTopic.id}`
        : "http://192.168.1.3:3000/api/topics",
      {
        method: editingTopic ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const result = await res.json();
    if (res.ok) {
      toast.success(result.message);
      fetchTopics();
      setName("");
      setVersion("");
      setEditingTopic(null);
    } else {
      toast.error(result.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`http://192.168.1.3:3000/api/topics/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (res.ok) {
      toast.success(result.message);
      fetchTopics();
    } else {
      toast.error(result.message || "Failed to delete topic.");
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setName(topic.name);
    setVersion(topic.version.toString());
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Topics</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Add Topic</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{editingTopic ? "Edit Topic" : "Add New Topic"}</DialogTitle>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Topic name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Version (default: 1)"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  type="number"
                />
                <Button type="submit">
                  {editingTopic ? "Update Topic" : "Create Topic"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell>{topic.version}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(topic)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(topic.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {topics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No topics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
