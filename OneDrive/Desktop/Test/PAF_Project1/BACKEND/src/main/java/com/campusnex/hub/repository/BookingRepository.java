package com.campusnex.hub.repository;

import com.campusnex.hub.model.entity.Booking;
import com.campusnex.hub.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByStatus(BookingStatus status);

    /** Conflict check: same resource + same date + overlapping time + not CANCELLED/REJECTED */
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE " +
           "b.resource.id = :resourceId AND " +
           "b.bookingDate = :date AND " +
           "b.status NOT IN ('CANCELLED', 'REJECTED') AND " +
           "b.id <> :excludeId AND " +
           "b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsConflict(
            @Param("resourceId")  Long resourceId,
            @Param("date")        LocalDate date,
            @Param("startTime")   LocalTime startTime,
            @Param("endTime")     LocalTime endTime,
            @Param("excludeId")   Long excludeId
    );
}
