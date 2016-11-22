    <?php
    session_start();
    include_once("conn.php");
    $cmd = $_POST['cmd'];

    if ($cmd == "ip_check") {
        $rows = array();
        $ip = $_POST['ip'];
        $SQL = "SELECT * FROM iplist WHERE ip = '$ip';";
        $result = $mysqli->query($SQL);
        $row_cnt = $result->num_rows;
        if ($row_cnt >= 1) {
            $SQL = "SELECT * FROM computers WHERE ip = '$ip';";
            $result = $mysqli->query($SQL);
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;            
            }
        echo json_encode($rows);
        } else {
            echo 0;
        }
        $mysqli->close();
    } else if ($cmd == 'trj_list'){
        $rows = array();
        $id = $_SESSION['user_id'];
        $SQL = "SELECT trj_lvl, trj_size, trj_name FROM trj_list WHERE id_usr = '$id';";
        $result = $mysqli->query($SQL);
        $row_cnt = $result->num_rows;
        if ($row_cnt >= 1) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;       
                echo json_encode($rows);     
            }
        } else {
            echo 0;
        }
        $mysqli->close();
    } else if($cmd == 'trj_create'){
        $trj_name = $_POST['trj_name'];
        $id = $_SESSION['user_id'];
        $SQL = "INSERT INTO trj_list (id_usr, trj_lvl, trj_size, trj_name) VALUES ('$id', '1', '100','$trj_name".".sh"."');";
        $result = $mysqli->query($SQL);
        if($result){
            echo trim('1');
        } else {
            echo trim(0);
        }
        $mysqli->close();
    } else if($cmd == 'crack_pwd'){
        $rows = array();
        $ip = $_SESSION['locked_target'];
        $pwd_try = $_POST['pwd'];
        $SQL = "SELECT pwd_crack FROM computers WHERE ip = '$ip' AND pwd_crack = '$pwd_try';";
        $result = $mysqli->query($SQL);
        $row_cnt = $result->num_rows;
        if ($row_cnt >= 1) {
            $_SESSION['cracked'] = true;
            echo 1;
        } else {
            echo 0;
        }
        $mysqli->close();
    } else if($cmd == 'lock_target'){
        $rows = array();
        $ip = $_POST['target'];
        $SQL = "SELECT ip FROM iplist WHERE ip = '$ip';";
        $result = $mysqli->query($SQL);
        $row_cnt = $result->num_rows;
        if ($row_cnt >= 1) {
            $_SESSION['locked_target'] = $ip;
            echo 1;
        } else {
            echo 0;
        }
        $mysqli->close();
    } else if($cmd == 'trj_upgrade'){
        $rows = array();
        $id = $_SESSION['user_id'];
        $trj_name = $_POST['trj_name'];
        $_SESSION['locked_trj_name'] = $trj_name;
        $SQL = "SELECT trj_lvl FROM trj_list WHERE id_usr = '$id' AND trj_name = '$trj_name';";
        $result = $mysqli->query($SQL);
        $row_cnt = $result->num_rows;
        if ($row_cnt >= 1) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;      
                echo json_encode($rows);      
            }
        } else {
            echo 0;
        }
        $mysqli->close();
    } else if($cmd == 'trj_upgrade_lvl'){
        $trj_lvl = 0;
        $rows = array();
        $id = $_SESSION['user_id'];
        $trj_name = $_SESSION['locked_trj_name'];
        $SQL = "SELECT trj_lvl FROM trj_list WHERE id_usr = '$id' AND trj_name = '$trj_name';";
        $result = $mysqli->query($SQL);
        $row_cnt = $result->num_rows;

        if ($row_cnt >= 1) {
            while ($row = $result->fetch_array()) {
                $trj_lvl = $row['trj_lvl'] + 1;

                $SQL = "UPDATE trj_list SET trj_lvl = '$trj_lvl' WHERE id_usr = '$id' AND trj_name = '$trj_name';";
                $result = $mysqli->query($SQL);
                if($result){
                    $SQL = "SELECT trj_lvl, trj_size, trj_name FROM trj_list WHERE id_usr = '$id' AND trj_name = '$trj_name';";
                    $result = $mysqli->query($SQL);
                    $row_cnt = $result->num_rows;
                    if ($row_cnt >= 1) {
                        while ($row = $result->fetch_assoc()) {
                            $rows[] = $row;      
                            echo json_encode($rows);      
                        }
                    } else {
                        echo 0;
                    }
                } else {
                    echo 0;
                }

            }
        } else {
            echo 0;
        }

       
        $mysqli->close();
    }



    ?>