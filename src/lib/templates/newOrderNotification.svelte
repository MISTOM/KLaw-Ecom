<script lang="ts">
	import type { Order, ProductOnOrder } from '@prisma/client';

	const { order, origin } = $props<{
		order: Order & { ProductOnOrder: (ProductOnOrder & { product: { name: string; price: number } })[] };
		origin: string;
	}>();
</script>

<div style="font-family: Arial, sans-serif; color: #333333; background-color: #f7f7f7; padding: 20px;">
	<table
		align="center"
		width="600"
		style="border-collapse: collapse; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd;"
	>
		<tbody>
			<tr>
				<td style="padding: 20px; text-align: center;">
					<img src="{origin}/kLawLogo.png" alt="Kenya Law Logo" style="max-width: 150px; margin-bottom: 20px;" />
				</td>
			</tr>

			<tr>
				<td style="padding: 0 20px 20px 20px;">
					<h1 style="font-size: 24px; color: #8f2a2b; text-align: center; margin-bottom: 20px;">
						New Order Received – Kenya Law Publications
					</h1>
					<p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
						Dear Admin,<br />
						A new order has been received on the Kenya Law Online Bookstore.<br />
						Please find the order details below:
					</p>

					<div style="margin: 20px 0; padding: 15px; background-color: #f8f8f8; border-radius: 4px;">
						<p style="margin: 0; font-weight: bold;">Order Details:</p>
						<p style="margin: 5px 0;">Order Number: {order.billRefNumber}</p>
						<p style="margin: 5px 0;">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
						<p style="margin: 5px 0;">Invoice Number: {order.invoiceNumber}</p>
						<p style="margin: 5px 0;">Status: {order.status}</p>
						<p style="margin: 5px 0;">Payment Description: {order.description}</p>
					</div>

					<p style="margin: 0; font-weight: bold;">Publications Ordered:</p>
					<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
						<thead>
							<tr style="background-color: #f0f0f0;">
								<th style="padding: 10px; text-align: left; border: 1px solid #dddddd;">Item</th>
								<th style="padding: 10px; text-align: center; border: 1px solid #dddddd;">Quantity</th>
								<th style="padding: 10px; text-align: right; border: 1px solid #dddddd;">Price</th>
								<th style="padding: 10px; text-align: right; border: 1px solid #dddddd;">Total</th>
							</tr>
						</thead>
						<tbody>
							{#each order.ProductOnOrder as item}
								<tr style="border-bottom: 1px solid #eeeeee;">
									<td style="padding: 10px; border: 1px solid #dddddd;">{item.product.name}</td>
									<td style="padding: 10px; text-align: center; border: 1px solid #dddddd;">{item.quantity}</td>
									<td style="padding: 10px; text-align: right; border: 1px solid #dddddd;"
										>KES {item.product.price.toLocaleString()}</td
									>
									<td style="padding: 10px; text-align: right; border: 1px solid #dddddd;">
										KES {(item.quantity * item.product.price).toLocaleString()}
									</td>
								</tr>
							{/each}
							<tr style="background-color: #f8f8f8;">
								<td
									colspan="3"
									style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #dddddd;"
								>
									Total Order Amount:
								</td>
								<td style="padding: 10px; text-align: right; font-weight: bold; border: 1px solid #dddddd;">
									KES {order.totalPrice.toLocaleString()}
								</td>
							</tr>
						</tbody>
					</table>

					<div
						style="margin: 20px 0; padding: 15px; background-color: #e8f4f8; border-left: 4px solid #8f2a2b; border-radius: 4px;"
					>
						<p style="margin: 0; font-weight: bold; color: #8f2a2b;">Action Required:</p>
						<p style="margin: 5px 0;">
							Please process this order and ensure the customer receives access to their purchased publications.
						</p>
						<p style="margin: 5px 0;">You can view the complete order details in the admin dashboard.</p>
					</div>

					<p style="font-size: 14px; line-height: 1.5;">
						<strong>Quick Links:</strong><br />
						<a href="{origin}/admin/orders" style="color: #8f2a2b; text-decoration: none;">
							→ View Order in Admin Dashboard
						</a><br />
						<a href="{origin}/admin/products" style="color: #8f2a2b; text-decoration: none;">
							→ Manage Products
						</a><br />
					</p>

					<hr style="margin: 20px 0; border: none; border-top: 1px solid #dddddd;" />

					<p style="font-size: 12px; line-height: 1.4; color: #666666;">
						This is an automated notification from the Kenya Law E-commerce system.<br />
						Order processed on: {new Date().toLocaleString()}<br />
						System: Kenya Law Online Bookstore
					</p>
				</td>
			</tr>

			<tr>
				<td style="padding: 20px; text-align: center; background-color: #f0f0f0;">
					<p style="font-size: 12px; color: #999999; margin-bottom: 5px;">
						© 2025 National Council for Law Reporting (Kenya Law)
					</p>
					<p style="font-size: 12px; color: #999999;">
						<a
							href="https://kenyalaw.org/kl/index.php?id=2161"
							style="color: #999999; text-decoration: underline;"
						>
							Creative Commons
						</a>
						&nbsp;|&nbsp;
						<a href="https://kenyalaw.org/kl/index.php?id=390" style="color: #999999; text-decoration: underline;">
							Privacy Policy and Disclaimer
						</a>
					</p>
				</td>
			</tr>
		</tbody>
	</table>
</div>
