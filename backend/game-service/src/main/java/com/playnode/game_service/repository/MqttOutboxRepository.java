package com.playnode.game_service.repository;

import com.playnode.game_service.entity.MqttOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MqttOutboxRepository extends JpaRepository<MqttOutbox, Long> {
    List<MqttOutbox> findTop20ByStatoOrderByCreatedAtAsc(String stato);
}
