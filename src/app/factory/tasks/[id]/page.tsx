import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import { TaskDetail } from '@/components/ControlPanel/TaskDetail';
import { Header } from '@/components/Dashboard/Header';
import { getTaskById } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadTaskContent(taskId: string): Promise<string | undefined> {
  try {
    const filePath = path.join(process.cwd(), 'factory/tasks', `${taskId}.md`);
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return undefined;
  }
}

async function loadReportContent(taskId: string): Promise<string | undefined> {
  try {
    const filePath = path.join(process.cwd(), 'factory/results', `${taskId}-REPORT.md`);
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const task = getTaskById(id);

  if (!task) {
    return { title: 'Задача не найдена | Factory OS' };
  }

  return {
    title: `${task.id}: ${task.title} | Factory OS`,
    description: task.title,
  };
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const task = getTaskById(id);

  if (!task) {
    notFound();
  }

  const [taskContent, reportContent] = await Promise.all([
    loadTaskContent(id),
    loadReportContent(id),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <TaskDetail
          task={task}
          taskContent={taskContent}
          reportContent={reportContent}
        />
      </div>
    </div>
  );
}
