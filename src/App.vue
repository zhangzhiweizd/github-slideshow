<!-- <script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style> -->
<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import axios from "axios";
import {Server, AlertCircle, CheckCircle, Activity, Search} from 'lucide-vue-next';
import type { ServerNode } from './types';

// 1. 状态定义
const servers = ref<ServerNode[]>([]); // 列表数据
const loading = ref<boolean>(false); // 加载状态
const searchQuery = ref<string>(""); //搜索关键词
const error_message = ref<string | null>(null);
  const reLoading = ref<boolean>(false);


// 2. 模拟后端api调用
const fetchServerStatus = async () => {
  loading.value= true;
  error_message.value= null;
try {
// 模拟网络延迟 800ms
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟返回数据 (这里硬编码，实际用 axios.get('/api/servers'))
const mockData: ServerNode[] = [
      { id: 1, name: '生产环境-订单服务', ip: '192.168.1.101', status: 'ONLINE', cpuUsage: 45, lastCheckTime: new Date().toLocaleTimeString() },
      { id: 2, name: '生产环境-支付网关', ip: '192.168.1.102', status: 'OFFLINE', cpuUsage: 0, lastCheckTime: new Date().toLocaleTimeString(), message: 'Connection refused: Port 8080' },
      { id: 3, name: '测试环境-用户中心', ip: '192.168.2.50', status: 'ONLINE', cpuUsage: 12, lastCheckTime: new Date().toLocaleTimeString() },
      { id: 4, name: '大数据-日志节点', ip: '192.168.3.20', status: 'MAINTENANCE', cpuUsage: 0, lastCheckTime: new Date().toLocaleTimeString(), message: 'Scheduled maintenance' },
    ];
    servers.value = mockData;
  } catch (error) {
    error_message = "获取数据失败，请检查网络连接";
    console.log(err);
  } finally {
    loading.value= false;
  }
};

// 模拟后端服务重启
const serviceRestart = async (node: ServerNode) => {
reLoading.value= true;
alert('正在重启' + node.name);
   await new Promise(resolve => setTimeout(resolve, 800));
  
  reLoading.value= false;
}

// --- 3. 计算属性 (类似 Java Stream filter，但会自动响应式更新) ---
const filteredServers = computed(() =>{
  if (!searchQuery.value) return servers.value;
  return servers.value.filter(s =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase())||
    s.ip.includes(searchQuery.value)
  );
});

// --- 4. 辅助函数 (用于样式绑定) ---

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ONLINE': return 'bg-green-100 text-green-800 border-green-200';
    case 'OFFLINE': return 'bg-red-100 texte-red-800 border-red-200';
    case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) =>{
  switch(status) {
      case 'ONLINE': return CheckCircle;
      case 'OFFLINE': return AlertCircle;
      default: return Activity;
  }
};

// --- 5. 生命周期 (类似 @PostConstruct) ---
onMounted(() => {
  fetchServerStatus();
});
</script>


<template>
  <div class="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
    
    <!-- 头部区域 -->
    <header class="max-w-6xl mx-auto mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Activity class="w-8 h-8 text-blue-600" />
          实施巡检仪表盘
        </h1>
        <p class="text-gray-500 mt-1">实时监控各节点服务健康状态</p>
      </div>
      <button 
        @click="fetchServerStatus" 
        :disabled="loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2">
        <Activity :class="{'animate-spin': loading}" class="w-4 h-4" />
        {{ loading ? '刷新中...' : '立即刷新' }}
      </button>
    </header>

    <!-- 控制栏 (搜索) -->
    <div class="max-w-6xl mx-auto mb-6 relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="w-5 h-5 text-gray-400" />
      </div>
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="搜索服务器名称或 IP..." 
        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
      />
    </div>

    <!-- 内容区域 -->
    <main class="max-w-6xl mx-auto">
      
      <!-- 错误提示 -->
      <div v-if="error_msg" class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
        {{ error_msg }}
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && servers.length === 0" class="text-center py-20 text-gray-500">
        正在加载监控数据...
      </div>

      <!-- 网格布局 (核心列表) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- 循环渲染卡片 (类似 JSP/Thymeleaf 的 forEach，但更强大) -->
        <div 
          v-for="node in filteredServers" 
          :key="node.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-300"
        >
          <!-- 卡片头部：状态条 -->
          <div :class="['px-6 py-4 border-b flex justify-between items-center', getStatusColor(node.status)]">
            <div class="flex items-center gap-2 font-semibold">
              <component :is="getStatusIcon(node.status)" class="w-5 h-5" />
              <span>{{ node.status }}</span>
            </div>
            <span class="text-xs opacity-75 font-mono">{{ node.lastCheckTime }}</span>
          </div>

          <!-- 卡片内容 -->
          <div class="p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ node.name }}</h3>
            <div class="flex items-center gap-2 text-gray-500 text-sm mb-4 font-mono bg-gray-50 p-2 rounded">
              <Server class="w-4 h-4" />
              {{ node.ip }}
            </div>

            <!-- 动态内容：CPU 使用率 -->
            <div class="mb-4">
              <div class="flex justify-between text-xs text-gray-600 mb-1">
                <span>CPU 使用率</span>
                <span>{{ node.cpuUsage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  :class="['h-2 rounded-full transition-all duration-500', node.cpuUsage > 80 ? 'bg-red-500' : 'bg-blue-500']" 
                  :style="{ width: node.cpuUsage + '%' }"></div>
              </div>
            </div>

            <!-- 错误信息展示 (条件渲染) -->
            <div v-if="node.message" class="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100 break-words">
              <strong>异常:</strong> {{ node.message }}
            </div>
            
            <div v-else class="mt-4 text-xs text-green-600 font-medium">
              ✓ 运行正常
            </div>
              <button 
                @click="serviceRestart(node);" 
                :disabled="reLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2">
                <Activity :class="{'animate-spin': reLoading}" class="w-4 h-4" />
                {{ reLoading ? '服务重启中...' : '立即重启' }}
              </button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && filteredServers.length === 0" class="text-center py-20 text-gray-400">
        没有找到匹配的服务器
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 这里可以写自定义 CSS，但我们主要用 Tailwind 类名 */
</style>