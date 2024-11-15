<!-- UserDetails.svelte -->
<script lang="ts">
	//TODO - Extract this
	function formatDate(dateString: Date) {
		return new Date(dateString).toLocaleDateString('en-UK', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	async function updateUserStatus(newStatus: string) {
		// Implementation for updating user status
		console.log('Updating status to:', newStatus);
	}

	async function resetPassword() {
		// Implementation for password reset
		console.log('Sending password reset email');
	}
</script>

<!-- 
<div class="container mx-auto p-6">
    <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <a
                href="/admin/users"
                class="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50"
            >
                ← Back to Users
            </a>
            <h1 class="text-3xl font-bold">User Details</h1>
        </div>
        <div class="flex space-x-2">
            <button
                on:click={() => updateUserStatus(user.status === 'active' ? 'inactive' : 'active')}
                class={`rounded-lg px-4 py-2 ${
                    user.status === 'active'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
                {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
            </button>
            <button
                on:click={resetPassword}
                class="rounded-lg border border-primary px-4 py-2 text-primary hover:bg-primary/10"
            >
                Reset Password
            </button>
        </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
        <!-- User Profile Card --
        <div class="col-span-2 space-y-6">
            <div class="rounded-lg border border-gray-200 bg-white p-6">
                <div class="mb-6 flex items-center space-x-4">
                    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 class="text-2xl font-semibold">{user.name}</h2>
                        <p class="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 class="mb-2 font-semibold">Contact Information</h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-gray-500">Email:</span> {user.email}</p>
                            <p><span class="text-gray-500">Phone:</span> {user.phone}</p>
                            <p><span class="text-gray-500">Address:</span> {user.address}</p>
                        </div>
                    </div>
                    <div>
                        <h3 class="mb-2 font-semibold">Account Details</h3>
                        <div class="space-y-2 text-sm">
                            <p><span class="text-gray-500">Member Since:</span> {formatDate(user.joinedDate)}</p>
                            <p><span class="text-gray-500">Last Login:</span> {formatDate(user.lastLogin)}</p>
                            <p>
                                <span class="text-gray-500">Status:</span>
                                <span class={`ml-1 inline-flex rounded-full px-2 text-xs font-semibold ${
                                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                                    user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {user.status}
                                </span>
                            </p>
                            <p>
                                <span class="text-gray-500">Role:</span>
                                <span class={`ml-1 inline-flex rounded-full px-2 text-xs font-semibold ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {user.role}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders --
            <div class="rounded-lg border border-gray-200 bg-white p-6">
                <h3 class="mb-4 text-lg font-semibold">Recent Orders</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr>
                                <th class="border-b px-4 py-2 text-left">Order ID</th>
                                <th class="border-b px-4 py-2 text-left">Date</th>
                                <th class="border-b px-4 py-2 text-left">Amount</th>
                                <th class="border-b px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody> -->
