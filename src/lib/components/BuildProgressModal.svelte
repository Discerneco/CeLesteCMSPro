<script>
  import { 
    CheckCircle, 
    Circle, 
    AlertCircle, 
    Loader2, 
    X, 
    Rocket, 
    Eye, 
    Clock, 
    Server, 
    Cpu, 
    HardDrive, 
    ExternalLink 
  } from '@lucide/svelte';
  import * as m from '$lib/paraglide/messages';

  // Props
  let { 
    isOpen = false, 
    siteName = '', 
    buildId = '', 
    onClose = () => {} 
  } = $props();

  // Build phases data - will be initialized with localized messages
  let buildPhases = $state({});
  
  // Initialize build phases with localized messages
  $effect(() => {
    buildPhases = {
      setup: {
        name: m.build_progress_phase_setup(),
        color: 'blue',
        steps: [
          { id: 'init', label: m.build_step_init(), icon: '🚀', status: 'pending' },
          { id: 'content', label: m.build_step_content(), icon: '📄', status: 'pending' },
          { id: 'build-start', label: m.build_step_build_start(), icon: '🏗️', status: 'pending' }
        ]
      },
      build: {
        name: m.build_progress_phase_build(),
        color: 'purple',
        steps: [
          { id: 'temp-project', label: m.build_step_temp_project(), icon: '📁', status: 'pending' },
          { id: 'copy-template', label: m.build_step_copy_template(), icon: '📁', status: 'pending' },
          { id: 'install-deps', label: m.build_step_install_deps(), icon: '📦', status: 'pending' },
          { id: 'generate-pages', label: m.build_step_generate_pages(), icon: '📄', status: 'pending' },
          { id: 'site-config', label: m.build_step_site_config(), icon: '⚙️', status: 'pending' },
          { id: 'build-sveltekit', label: m.build_step_build_sveltekit(), icon: '🔨', status: 'pending' }
        ]
      },
      deploy: {
        name: m.build_progress_phase_deploy(),
        color: 'green',
        steps: [
          { id: 'copy-build', label: m.build_step_copy_build(), icon: '📁', status: 'pending' },
          { id: 'process-html', label: m.build_step_process_html(), icon: '🔄', status: 'pending' },
          { id: 'complete', label: m.build_step_complete(), icon: '✅', status: 'pending' }
        ]
      }
    };
  });

  // State management with Svelte 5 runes
  let phases = $derived(buildPhases);
  let buildState = $state('building'); // 'building' | 'completed'
  let currentPhase = $state('setup');
  let startTime = $state(null);
  let endTime = $state(null);
  let elapsedTime = $state(0);
  let buildStats = $state({
    totalSteps: 0,
    completedSteps: 0,
    pagesGenerated: 0,
    filesProcessed: 0,
    totalSize: '0 MB'
  });
  let resources = $state({
    cpu: 0,
    memory: 0,
    disk: 0
  });

  // Get all steps for stats - computed from current phases
  let allSteps = $derived([
    ...(phases.setup?.steps || []),
    ...(phases.build?.steps || []),
    ...(phases.deploy?.steps || [])
  ]);

  // Timer for elapsed time
  $effect(() => {
    if (startTime && buildState === 'building') {
      const timer = setInterval(() => {
        elapsedTime = Date.now() - startTime;
      }, 1000);
      return () => clearInterval(timer);
    }
  });

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const simulateResourceUsage = () => {
    resources.cpu = Math.floor(Math.random() * 40) + 20;
    resources.memory = Math.floor(Math.random() * 200) + 150;
    resources.disk = Math.floor(Math.random() * 50) + 10;
  };

  const startBuild = () => {
    const now = Date.now();
    startTime = now;
    buildState = 'building';
    currentPhase = 'setup';
    
    // Reset phases to fresh state
    phases = JSON.parse(JSON.stringify(buildPhases));
    buildStats = {
      totalSteps: allSteps.length,
      completedSteps: 0,
      pagesGenerated: 0,
      filesProcessed: 0,
      totalSize: '0 MB'
    };

    simulateBuild();
  };

  const simulateBuild = () => {
    const stepTimings = [800, 1200, 1000, 2000, 3000, 4000, 2000, 1500, 3500, 1500, 1200, 800];
    let completedCount = 0;

    allSteps.forEach((step, index) => {
      const timing = stepTimings[index] || 1000;
      
      setTimeout(() => {
        // Determine phase
        let phase = 'setup';
        if (index >= 3 && index < 9) phase = 'build';
        if (index >= 9) phase = 'deploy';
        
        currentPhase = phase;

        // Start step
        const newPhases = { ...phases };
        Object.keys(newPhases).forEach(phaseKey => {
          newPhases[phaseKey] = {
            ...newPhases[phaseKey],
            steps: newPhases[phaseKey].steps.map(s => 
              s.id === step.id ? { 
                ...s, 
                status: 'running',
                startTime: Date.now()
              } : s
            )
          };
        });
        phases = newPhases;

        // Simulate resource usage
        const resourceInterval = setInterval(simulateResourceUsage, 500);

        // Complete step
        setTimeout(() => {
          clearInterval(resourceInterval);
          
          const stepDuration = timing - 200;
          completedCount++;

          const completedPhases = { ...phases };
          Object.keys(completedPhases).forEach(phaseKey => {
            completedPhases[phaseKey] = {
              ...completedPhases[phaseKey],
              steps: completedPhases[phaseKey].steps.map(s => 
                s.id === step.id ? { 
                  ...s, 
                  status: 'completed',
                  duration: stepDuration,
                  endTime: Date.now()
                } : s
              )
            };
          });
          phases = completedPhases;

          // Update stats
          buildStats = {
            ...buildStats,
            completedSteps: completedCount,
            ...(step.id === 'content' && { pagesGenerated: 2, filesProcessed: 4 }),
            ...(step.id === 'process-html' && { filesProcessed: 7, totalSize: '2.4 MB' })
          };

          // Complete build
          if (index === allSteps.length - 1) {
            setTimeout(() => {
              endTime = Date.now();
              buildState = 'completed';
              resources = { cpu: 0, memory: 0, disk: 0 };
            }, 500);
          }
        }, 200);

      }, stepTimings.slice(0, index + 1).reduce((a, b) => a + b, 0));
    });
  };

  const getPhaseStats = (phaseName) => {
    const phase = phases[phaseName];
    if (!phase) return { completed: 0, total: 0 };
    const completed = phase.steps.filter(s => s.status === 'completed').length;
    return { completed, total: phase.steps.length };
  };

  const getTotalDuration = () => {
    if (!endTime || !startTime) return elapsedTime;
    return endTime - startTime;
  };

  // Auto-start build when modal opens
  $effect(() => {
    if (isOpen && !startTime) {
      setTimeout(startBuild, 500);
    }
  });
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-base-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
      
      {#if buildState === 'building'}
        <!-- Building State - Pipeline View -->
        <!-- Fixed Header -->
        <div class="flex-shrink-0 p-6 border-b border-base-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-xl font-semibold text-base-content">{m.build_progress_building_title({ siteName })}</h3>
              <p class="text-sm text-base-content/70">{m.build_progress_build_id({ buildId })}</p>
            </div>
            <button
              onclick={onClose}
              class="btn btn-ghost btn-sm btn-circle"
              disabled={true}
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-4 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {Math.round((buildStats.completedSteps / buildStats.totalSteps) * 100)}%
              </div>
              <div class="text-xs text-base-content/60">{m.build_progress_stats_progress()}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{formatTime(elapsedTime)}</div>
              <div class="text-xs text-base-content/60">{m.build_progress_stats_elapsed()}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{buildStats.pagesGenerated}</div>
              <div class="text-xs text-base-content/60">{m.build_progress_stats_pages()}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{buildStats.filesProcessed}</div>
              <div class="text-xs text-base-content/60">{m.build_progress_stats_files()}</div>
            </div>
          </div>

          <!-- Resource Monitoring -->
          <div class="flex items-center justify-center gap-6 mb-4 p-3 bg-base-200/50 rounded-lg">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-blue-500" />
              <span class="text-sm font-medium">{m.build_progress_resource_cpu()}</span>
              <span class="text-sm font-bold text-blue-500">
                {resources.cpu}%
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Server class="w-4 h-4 text-purple-500" />
              <span class="text-sm font-medium">{m.build_progress_resource_memory()}</span>
              <span class="text-sm font-bold text-purple-500">
                {resources.memory}MB
              </span>
            </div>
            <div class="flex items-center gap-2">
              <HardDrive class="w-4 h-4 text-green-500" />
              <span class="text-sm font-medium">{m.build_progress_resource_disk()}</span>
              <span class="text-sm font-bold text-green-500">{resources.disk}MB/s</span>
            </div>
          </div>

          <!-- Pipeline View -->
          <div class="flex items-center justify-between gap-4 overflow-x-auto pb-2">
            {#each Object.entries(phases) as [key, phase], phaseIndex}
              {@const stats = getPhaseStats(key)}
              {@const isActive = currentPhase === key}
              {@const isCompleted = stats.completed === stats.total}
              
              <div class="flex-shrink-0 p-4 rounded-lg border-2 transition-all min-w-[200px] {
                isActive ? 'border-primary bg-primary/10 shadow-lg' :
                isCompleted ? 'border-success bg-success/10' :
                'border-base-300'
              }">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-base-content">{phase.name}</span>
                  <span class="text-sm text-base-content/60">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                
                <div class="space-y-1">
                  {#each phase.steps as step}
                    <div class="flex items-center gap-2">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center {
                        step.status === 'completed' ? 'bg-success' :
                        step.status === 'running' ? 'bg-primary' :
                        'bg-base-300'
                      }">
                        {#if step.status === 'completed'}
                          <CheckCircle class="w-3 h-3 text-base-100" />
                        {:else if step.status === 'running'}
                          <Loader2 class="w-3 h-3 text-base-100 animate-spin" />
                        {:else}
                          <Circle class="w-3 h-3 text-base-100" />
                        {/if}
                      </div>
                      <span class="text-xs text-base-content truncate">
                        {step.icon} {step.label.split(' ').slice(0, 3).join(' ')}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
              
              {#if phaseIndex < Object.keys(phases).length - 1}
                <div class="flex-shrink-0 flex items-center">
                  <div class="w-8 h-0.5 {
                    isCompleted ? 'bg-success' : 'bg-base-300'
                  }"></div>
                  <div class="w-2 h-2 rounded-full border-2 {
                    isCompleted ? 'border-success bg-success' : 'border-base-300'
                  }"></div>
                  <div class="w-8 h-0.5 {
                    Object.entries(phases)[phaseIndex + 1] && getPhaseStats(Object.keys(phases)[phaseIndex + 1]).completed > 0 
                    ? 'bg-success' : 'bg-base-300'
                  }"></div>
                </div>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Current Activity -->
        <div class="flex-1 p-6">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Loader2 class="w-8 h-8 text-primary animate-spin" />
            </div>
            <h4 class="text-lg font-medium text-base-content mb-2">
              {m.build_progress_building_message()}
            </h4>
            <p class="text-base-content/60">
              {allSteps.find(s => s.status === 'running')?.label || m.build_progress_processing_steps()}
            </p>
          </div>
        </div>

      {:else if buildState === 'completed'}
        <!-- Completed State - GitHub Summary Style -->
        <div class="flex-shrink-0 p-6 border-b border-base-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-base-content">{m.build_progress_complete_title()}</h3>
            <button
              onclick={onClose}
              class="btn btn-ghost btn-sm btn-circle"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex-1 p-6 overflow-y-auto">
          <!-- Success Header -->
          <div class="flex items-start gap-4 mb-6 p-4 bg-success/10 rounded-lg border border-success/20">
            <div class="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
              <CheckCircle class="w-5 h-5 text-base-100" />
            </div>
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-success mb-1">
                {m.build_progress_all_checks_passed()}
              </h4>
              <p class="text-sm text-success/80">
                {m.build_progress_checks_completed({ totalSteps: buildStats.totalSteps, duration: formatTime(getTotalDuration()) })}
              </p>
            </div>
          </div>

          <!-- Phase Summary -->
          <div class="space-y-3 mb-6">
            {#each Object.entries(phases) as [key, phase]}
              {@const stats = getPhaseStats(key)}
              {@const phaseDuration = phase.steps
                .filter(s => s.duration)
                .reduce((total, s) => total + s.duration, 0)}
              
              <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <CheckCircle class="w-5 h-5 text-success" />
                  <div>
                    <span class="font-medium text-base-content">
                      {m.build_progress_phase_summary({ phaseName: phase.name })}
                    </span>
                    <span class="text-sm text-base-content/60 ml-2">
                      {stats.completed} {m.build_progress_steps()}
                    </span>
                  </div>
                </div>
                <div class="text-sm text-base-content/60">
                  {m.build_progress_successful_in({ duration: formatTime(phaseDuration) })}
                </div>
              </div>
            {/each}
          </div>

          <!-- Build Details -->
          <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-base-200 rounded-lg">
            <div>
              <div class="text-2xl font-bold text-base-content">{buildStats.pagesGenerated}</div>
              <div class="text-sm text-base-content/60">{m.build_progress_pages_generated()}</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">{buildStats.filesProcessed}</div>
              <div class="text-sm text-base-content/60">{m.build_progress_files_processed()}</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">{buildStats.totalSize}</div>
              <div class="text-sm text-base-content/60">{m.build_progress_total_size()}</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-base-content">{formatTime(getTotalDuration())}</div>
              <div class="text-sm text-base-content/60">{m.build_progress_build_time()}</div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="flex-shrink-0 p-6 border-t border-base-200 bg-base-200">
          <div class="flex items-center justify-between">
            <p class="text-sm text-base-content/60">
              {m.build_progress_cli_api_access()}
            </p>
            <div class="flex gap-3">
              <button class="btn btn-ghost btn-sm">
                {m.build_progress_view_logs()}
              </button>
              <button class="btn btn-success btn-sm">
                <ExternalLink class="w-4 h-4" />
                {m.build_progress_view_site()}
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Custom animations for the build modal */
  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>