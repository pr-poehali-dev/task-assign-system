import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Icon from '@/components/ui/icon';
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  tasksCount: number;
  completionRate: number;
  avatar: string;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'employees'>('dashboard');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [scrollerRotation, setScrollerRotation] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Разработать новый модуль',
      description: 'Создать модуль аналитики для системы',
      assignee: 'Алексей Иванов',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Исправить баги в интерфейсе',
      description: 'Устранить ошибки отображения на мобильных устройствах',
      assignee: 'Мария Петрова',
      status: 'completed',
      priority: 'medium',
      dueDate: '2024-01-10'
    },
    {
      id: 3,
      title: 'Обновить документацию',
      description: 'Дополнить техническую документацию проекта',
      assignee: 'Дмитрий Смирнов',
      status: 'pending',
      priority: 'low',
      dueDate: '2024-01-20'
    }
  ]);

  const [employees] = useState<Employee[]>([
    { id: 1, name: 'Алексей Иванов', role: 'Senior Developer', tasksCount: 12, completionRate: 85, avatar: '' },
    { id: 2, name: 'Мария Петрова', role: 'UI/UX Designer', tasksCount: 8, completionRate: 92, avatar: '' },
    { id: 3, name: 'Дмитрий Смирнов', role: 'Frontend Developer', tasksCount: 15, completionRate: 78, avatar: '' },
    { id: 4, name: 'Елена Козлова', role: 'QA Engineer', tasksCount: 10, completionRate: 88, avatar: '' }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignee || !newTask.dueDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: tasks.length + 1,
      ...newTask,
      status: 'pending'
    };

    setTasks([...tasks, task]);
    setIsCreateTaskOpen(false);
    setNewTask({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '' });
    
    toast({
      title: "Успешно",
      description: "Задача создана и назначена сотруднику"
    });
  };

  const toggleTaskStatus = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 
                         task.status === 'pending' ? 'in-progress' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const statsData = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    completionRate: Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
  };

  const handleScrollerMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !mainRef.current) return;
      
      const deltaY = e.clientY - startYRef.current;
      setPullDistance(Math.max(0, deltaY));
      setScrollerRotation(deltaY * 0.5);
      
      if (deltaY > 0) {
        mainRef.current.scrollTop += deltaY * 0.3;
        startYRef.current = e.clientY;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setPullDistance(0);
      setScrollerRotation(0);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-background relative">
      <div 
        ref={scrollerRef}
        onMouseDown={handleScrollerMouseDown}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(-50%) translateY(${pullDistance * 0.5}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="relative flex gap-6" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))' }}>
          <div className="relative w-16 h-20 rounded-full"
               style={{
                 background: 'radial-gradient(ellipse at 35% 35%, #ffd4e0, #ffb3cc 40%, #ff99bb 100%)',
                 boxShadow: 'inset -4px -6px 15px rgba(0,0,0,0.15), inset 3px 3px 10px rgba(255,255,255,0.4)',
                 transform: 'perspective(500px) rotateY(-8deg)'
               }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                 style={{
                   background: 'radial-gradient(circle at 40% 40%, #ff85a8, #e6719a)',
                   boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.2)'
                 }} />
          </div>
          
          <div className="relative w-16 h-20 rounded-full"
               style={{
                 background: 'radial-gradient(ellipse at 65% 35%, #ffd4e0, #ffb3cc 40%, #ff99bb 100%)',
                 boxShadow: 'inset 4px -6px 15px rgba(0,0,0,0.15), inset -3px 3px 10px rgba(255,255,255,0.4)',
                 transform: 'perspective(500px) rotateY(8deg)'
               }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                 style={{
                   background: 'radial-gradient(circle at 40% 40%, #ff85a8, #e6719a)',
                   boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.2)'
                 }} />
          </div>
        </div>
      </div>
      <div className="flex">
        <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="LayoutDashboard" className="text-primary-foreground" size={20} />
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground">TaskFlow</h1>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="LayoutDashboard" size={20} />
                <span>Дашборд</span>
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'tasks' 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="CheckSquare" size={20} />
                <span>Задачи</span>
              </button>

              <button
                onClick={() => setActiveTab('employees')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'employees' 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="Users" size={20} />
                <span>Сотрудники</span>
              </button>
            </nav>
          </div>
        </aside>

        <main ref={mainRef} className="flex-1 p-8 overflow-y-auto max-h-screen">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Обзор системы</h2>
                <p className="text-muted-foreground">Ключевые показатели и статистика</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="animate-scale-in">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Всего задач</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="ListTodo" className="text-primary" size={24} />
                      </div>
                      <div className="text-3xl font-bold">{statsData.totalTasks}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Завершено</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Icon name="CheckCircle2" className="text-green-500" size={24} />
                      </div>
                      <div className="text-3xl font-bold">{statsData.completedTasks}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Icon name="Clock" className="text-blue-500" size={24} />
                      </div>
                      <div className="text-3xl font-bold">{statsData.inProgressTasks}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Процент выполнения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Icon name="TrendingUp" className="text-accent" size={24} />
                      </div>
                      <div className="text-3xl font-bold">{statsData.completionRate}%</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Последние задачи</CardTitle>
                    <CardDescription>Активные задачи в системе</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-2 h-2 mt-2 rounded-full ${getStatusColor(task.status)}`} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{task.assignee}</p>
                          </div>
                          <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Топ сотрудников</CardTitle>
                    <CardDescription>По проценту выполнения задач</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employees
                        .sort((a, b) => b.completionRate - a.completionRate)
                        .slice(0, 3)
                        .map((employee, index) => (
                          <div key={employee.id} className="flex items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                {index + 1}
                              </div>
                              <Avatar>
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">{employee.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{employee.completionRate}%</p>
                              <p className="text-xs text-muted-foreground">{employee.tasksCount} задач</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Управление задачами</h2>
                  <p className="text-muted-foreground">Создавайте и отслеживайте задачи</p>
                </div>
                <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Icon name="Plus" size={18} />
                      Создать задачу
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Новая задача</DialogTitle>
                      <DialogDescription>Заполните информацию о задаче</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Название задачи</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="Введите название"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="Введите описание задачи"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assignee">Исполнитель</Label>
                        <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите сотрудника" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priority">Приоритет</Label>
                          <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Низкий</SelectItem>
                              <SelectItem value="medium">Средний</SelectItem>
                              <SelectItem value="high">Высокий</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Срок</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>Отмена</Button>
                      <Button onClick={handleCreateTask}>Создать</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="mt-1"
                        >
                          {task.status === 'completed' ? (
                            <Icon name="CheckCircle2" className="text-green-500" size={24} />
                          ) : (
                            <Icon name="Circle" className="text-muted-foreground" size={24} />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Icon name="User" size={16} className="text-muted-foreground" />
                              <span>{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={16} className="text-muted-foreground" />
                              <span>{new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status === 'completed' ? 'Завершена' : 
                               task.status === 'in-progress' ? 'В работе' : 'Ожидает'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Команда</h2>
                <p className="text-muted-foreground">Информация о сотрудниках и их результатах</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {employees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="text-lg bg-primary/10 text-primary">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{employee.name}</h3>
                          <p className="text-muted-foreground mb-4">{employee.role}</p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Задач назначено</span>
                              <span className="font-semibold">{employee.tasksCount}</span>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Процент выполнения</span>
                                <span className="font-semibold">{employee.completionRate}%</span>
                              </div>
                              <Progress value={employee.completionRate} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;