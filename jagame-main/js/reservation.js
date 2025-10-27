
jQuery(document).ready(function ($) {
    // تابع برای دریافت رزروها
    function loadReservations() {
        $('#reservationsTable').html('<tr><td colspan="6" class="py-4 text-center text-gray-500">در حال بارگذاری رزروها...</td></tr>');

        $.ajax({
            url: reservation_ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'get_game_net_reservations',
                security: reservation_ajax_object.reservation_nonce,
                game_net_id: reservation_ajax_object.game_net_id
            },
            success: function (response) {
                if (response.success) {
                    displayReservations(response.data.reservations);
                } else {
                    $('#reservationsTable').html('<tr><td colspan="6" class="py-4 text-center text-red-500">خطا در دریافت اطلاعات: ' + response.data + '</td></tr>');
                }
            },
            error: function () {
                $('#reservationsTable').html('<tr><td colspan="6" class="py-4 text-center text-red-500">خطا در ارتباط با سرور</td></tr>');
            }
        });
    }

    // تابع برای نمایش رزروها در جدول
    function displayReservations(reservations) {
        if (reservations.length === 0) {
            $('#reservationsTable').html('<tr><td colspan="6" class="py-4 text-center text-gray-500">هیچ رزروی یافت نشد</td></tr>');
            return;
        }

        var html = '';
        reservations.forEach(function (reservation) {
            // محاسبه مدت زمان
            var startTime = new Date(reservation.start_time);
            var endTime = new Date(reservation.end_time);
            var durationHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));

            // کلاس وضعیت
            var statusClass = '';
            var statusText = '';

            switch (reservation.status) {
                case 'pending':
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    statusText = 'در انتظار';
                    break;
                case 'confirmed':
                    statusClass = 'bg-blue-100 text-blue-800';
                    statusText = 'تایید شده';
                    break;
                case 'cancelled':
                    statusClass = 'bg-red-100 text-red-800';
                    statusText = 'لغو شده';
                    break;
                case 'completed':
                    statusClass = 'bg-green-100 text-green-800';
                    statusText = 'تکمیل شده';
                    break;
                default:
                    statusClass = 'bg-gray-100 text-gray-800';
                    statusText = 'نامشخص';
            }

            // فرمت تاریخ و ساعت
            var startDate = new Date(reservation.start_time).toLocaleDateString('fa-IR');
            var startTimeFormatted = new Date(reservation.start_time).toLocaleTimeString('fa-IR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            html += '<tr class="border-b border-gray-100 hover:bg-gray-50">';
            html += '<td class="py-3 px-4 hidden md:table-cell">' + (reservation.user_name || 'مهمان') + '</td>';
            html += '<td class="py-3 px-4">' + reservation.device_name + '</td>';
            html += '<td class="py-3 px-4">' + startDate + ' - ' + startTimeFormatted + '</td>';
            html += '<td class="py-3 px-4">' + durationHours + ' ساعت</td>';
            html += '<td class="py-3 px-4">';
            html += '<span class="inline-flex items-center lg:px-2.5 lg:py-0.5 rounded-full text-xs font-medium ' + statusClass + '">';
            html += '<p class="hidden lg:table-cell">' + statusText + '</p>';
            html += '<div class="lg:hidden w-6 h-6"></div>';
            html += '</span>';
            html += '</td>';
            html += '<td class="py-3 px-4">';

            if (reservation.status === 'pending') {
                html += '<button class="confirm-reservation bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs mr-1" data-id="' + reservation.id + '">تایید</button>';
                html += '<button class="cancel-reservation bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs" data-id="' + reservation.id + '">لغو</button>';
            } else if (reservation.status === 'confirmed') {
                html += '<button class="complete-reservation bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1" data-id="' + reservation.id + '">تکمیل</button>';
                html += '<button class="cancel-reservation bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs" data-id="' + reservation.id + '">لغو</button>';
            }

            html += '</td>';
            html += '</tr>';
        });

        $('#reservationsTable').html(html);

        // اضافه کردن event listener برای دکمه‌ها
        $('.confirm-reservation').click(function () {
            updateReservationStatus($(this).data('id'), 'confirmed');
        });

        $('.cancel-reservation').click(function () {
            updateReservationStatus($(this).data('id'), 'cancelled');
        });

        $('.complete-reservation').click(function () {
            updateReservationStatus($(this).data('id'), 'completed');
        });
    }

    // تابع برای به‌روزرسانی وضعیت رزرو
    function updateReservationStatus(reservationId, newStatus) {
        if (!confirm('آیا از تغییر وضعیت این رزرو اطمینان دارید؟')) {
            return;
        }

        $.ajax({
            url: reservation_ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'update_reservation_status',
                security: reservation_ajax_object.reservation_nonce,
                reservation_id: reservationId,
                new_status: newStatus
            },
            success: function (response) {
                if (response.success) {
                    loadReservations(); // بارگذاری مجدد رزروها
                } else {
                    alert('خطا در به‌روزرسانی وضعیت: ' + response.data);
                }
            },
            error: function () {
                alert('خطا در ارتباط با سرور');
            }
        });
    }

    // بارگذاری اولیه رزروها
    loadReservations();

    // رویداد کلیک برای دکمه بروزرسانی
    $('#refreshReservations').click(function () {
        loadReservations();
    });
});